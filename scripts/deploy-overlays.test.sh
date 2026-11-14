#!/bin/sh
# Render deploy/ (the production entry), deploy/prod and deploy/dev, and keep
# production's identity out of dev. Needs kubectl (with its built-in Kustomize)
# and yq, both present on the runner.
set -eu

repo_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

fail() {
	printf 'FAIL: %s\n' "$*" >&2
	exit 1
}

kubectl kustomize "$repo_root/deploy" > "$work/root.yaml" || fail "deploy/ does not render"
kubectl kustomize "$repo_root/deploy/prod" > "$work/prod.yaml" || fail "deploy/prod does not render"
kubectl kustomize "$repo_root/deploy/dev" > "$work/dev.yaml" || fail "deploy/dev does not render"

# The platform reconciles deploy/ for production, so it must be exactly deploy/prod.
cmp -s "$work/root.yaml" "$work/prod.yaml" ||
	fail "deploy/kustomization.yaml must include only ./prod"

count_kind() {
	KIND=$1 yq eval-all '[.] | map(select(.kind == strenv(KIND))) | length' "$work/dev.yaml"
}

# Dev runs the site alone: one Deployment with one replica.
[ "$(count_kind Deployment)" -eq 1 ] || fail "deploy/dev must render only the site's Deployment"
[ "$(yq eval-all 'select(.kind == "Deployment") | .metadata.name' "$work/dev.yaml")" = ascoachingogvaner ] ||
	fail "deploy/dev must render the ascoachingogvaner Deployment"
[ "$(yq eval-all 'select(.kind == "Deployment") | .spec.replicas' "$work/dev.yaml")" = 1 ] ||
	fail "deploy/dev must run one replica"

# Production identity stays in deploy/prod: routes, domain, TLS, DNS, the
# disruption budget and the simply.com credentials.
for kind in HTTPRoute Gateway ReferenceGrant Certificate Issuer PodDisruptionBudget \
	SecretStore ExternalSecret PushSecret Password ServiceAccount; do
	[ "$(count_kind "$kind")" -eq 0 ] || fail "deploy/dev renders a $kind; it belongs in deploy/prod"
done
for needle in ascoachingogvaner.dk apps/ascoachingogvaner/ simply-credentials 'namespace: ascoachingogvaner$'; do
	if grep -Eq -- "$needle" "$work/dev.yaml"; then
		fail "deploy/dev references production ($needle)"
	fi
done
# Dev's network policy is created fresh in its own namespace, where the
# platform refuses a tenant policy that names any namespace.
if grep -Fq 'io.kubernetes.pod.namespace' "$work/dev.yaml"; then
	fail "deploy/dev network policy names a namespace; select pods by label instead"
fi

printf '%s\n' 'PASS: deploy/ renders deploy/prod; deploy/dev runs one replica without production identity'
