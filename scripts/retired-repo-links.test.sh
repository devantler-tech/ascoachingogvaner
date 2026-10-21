#!/usr/bin/env bash
# Keep this consumer's documentation scan runnable, bounded, and required.
set -euo pipefail

root="$(CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
yq -o=json '.' "$root/.github/workflows/ci.yaml" >"$work/ci.json"
if [[ -f "$root/.github/workflows/retired-links.yaml" ]]; then
  yq -o=json '.' "$root/.github/workflows/retired-links.yaml" >"$work/workflow.json"
else
  printf 'null\n' >"$work/workflow.json"
fi
if [[ -f "$root/.github/actions/documentation-links/action.yaml" ]]; then
  yq -o=json '.' "$root/.github/actions/documentation-links/action.yaml" >"$work/action.json"
else
  printf 'null\n' >"$work/action.json"
fi
if [[ -f "$root/.github/retired-repo-links.json" ]]; then
  cp "$root/.github/retired-repo-links.json" "$work/config.json"
else
  printf 'null\n' >"$work/config.json"
fi
jq -n --slurpfile ci "$work/ci.json" --slurpfile config "$work/config.json" --slurpfile workflow "$work/workflow.json" --slurpfile action "$work/action.json" \
  '{ci:$ci[0],config:$config[0],workflow:$workflow[0],action:$action[0]}' >"$work/bundle.json"

# Validate a JSON bundle containing the consumer scope and CI workflow definitions.
# Require a bounded read-only scan, an independent missing-config control, and an always-running aggregate.
# Return zero for valid wiring; otherwise jq reports the violated invariant and returns nonzero.
guard() {
  jq -e '
    def runnable: .if == null and (.["continue-on-error"] // false) == false;
    def local_caller:
      runnable and .needs == null and .["runs-on"] == "ubuntu-latest" and
      .["timeout-minutes"] == 10 and .permissions == {contents:"read"} and
      (.steps | length) == 3 and
      (.steps[0] | runnable and (.uses | test("^step-security/harden-runner@[0-9a-f]{40}$"))) and
      (.steps[1] | runnable and (.uses | test("^actions/checkout@[0-9a-f]{40}$")) and .with["persist-credentials"] == false) and
      .steps[2] == {name:"Check documentation and failure controls",uses:"./.github/actions/documentation-links"};
    .ci as $ci | .workflow as $workflow | .action as $action | $workflow.jobs["validate-retired-links"] as $job |
    if .config != {version:1,repositories:["devantler-tech/reusable-workflows"],paths:["README.md","AGENTS.md"],exceptions:[]}
    then error("consumer scope must be explicit and bounded")
    elif ($ci.jobs["validate-retired-links"] | local_caller | not)
    then error("required caller must bind the local guard without bypasses")
    elif $workflow.on.push.branches != ["main"] or ($workflow.on | has("workflow_call")) or
      ($action.runs.using != "composite")
    then error("same guard must execute after merge and from required CI")
    elif $ci.permissions != {contents:"read"} or $workflow.permissions != {contents:"read"} or
      $job == null or $job.permissions != {contents:"read"} or
      ($job | local_caller | not) or
      ($action.runs.steps | tostring | test("secrets|github[.]token|create-github-app-token";"i")) or
      any($action.runs.steps[]; has("run") and .shell != "bash")
    then error("consumer scan must execute without write credentials")
    elif ([$action.runs.steps[] | select(.id == "links") |
      select(runnable and .with.enabled == "true" and
        ((.uses // "") | test("^devantler-tech/[.]github/actions/validate-retired-repo-links@[0-9a-f]{40}$")))] | length) != 1
    then error("released consumer action must execute explicitly enabled")
    elif ([$action.runs.steps[] | select(.name == "Require a complete scan") |
      select(runnable and .env.VALIDATED == "${{ steps.links.outputs.validated }}" and
        .run == "test \"$VALIDATED\" = true")] | length) != 1
    then error("consumer scan must prove complete validation")
    elif ([$action.runs.steps[] | select(.id == "missing-config") |
      select(.if == null and .["continue-on-error"] == true and
        .uses == ($action.runs.steps[] | select(.id == "links") | .uses) and
        .with == {enabled:"true","config-file":".github/missing-retired-repo-links.json"})] | length) != 1
    then error("missing configuration must use the clean consumer root")
    elif ([$action.runs.steps[] | select(.name == "Require both negative controls to fail without success output") |
      select(.if == "always()" and (.["continue-on-error"] // false) == false and .env == {
        LINK_OUTCOME:"${{ steps.negative.outcome }}",
        LINK_VALIDATED:"${{ steps.negative.outputs.validated }}",
        CONFIG_OUTCOME:"${{ steps.missing-config.outcome }}",
        CONFIG_VALIDATED:"${{ steps.missing-config.outputs.validated }}"
      })] | length) != 1
    then error("negative rejection proof must bind its own results and always run")
    elif ([$action.runs.steps[] | select(.id == "negative") |
      select(.if == null and .["continue-on-error"] == true and
        .uses == ($action.runs.steps[] | select(.id == "links") | .uses) and
        .with == {enabled:"true","working-directory":"${{ steps.fixture.outputs.directory }}"})] | length) != 1
    then error("retired-link control must use its fixture and continue after failure")
    elif (["always()", "${{ always() }}"] | index($ci.jobs["ci-required-checks"].if)) == null or
      ($ci.jobs["ci-required-checks"].needs | index("validate-retired-links")) == null or
      ($ci.jobs["ci-required-checks"].steps | any(.with["job-results"] // "" |
        contains("needs.validate-retired-links.result"))) != true
    then error("consumer scan must gate required CI")
    else true end' "$1" >/dev/null
}

guard "$work/bundle.json"
count=0
while IFS=$'\t' read -r label mutation diagnostic; do
  jq "$mutation" "$work/bundle.json" >"$work/mutated.json"
  if guard "$work/mutated.json" >"$work/result" 2>&1; then
    echo "FAIL: $label was accepted" >&2
    exit 1
  fi
  if ! grep -qF "$diagnostic" "$work/result"; then
    cat "$work/result" >&2
    echo "FAIL: $label did not report $diagnostic" >&2
    exit 1
  fi
  count=$((count + 1))
done <<'CASES'
missing config	.config=null	explicit and bounded
broadened scope	.config.paths += ["."]	explicit and bounded
historical bypass	.config.exceptions=[{}]	explicit and bounded
skipped caller	.ci.jobs["validate-retired-links"].if="false"	bind the local guard
lost main observation	del(.workflow.on.push)	execute after merge
single-consumer export	.workflow.on.workflow_call=null	execute after merge
lost local action	.action=null	execute after merge
unbound main action	.workflow.jobs["validate-retired-links"].steps[2].uses="./other"	execute without write
persisted PR credential	.ci.jobs["validate-retired-links"].steps[1].with["persist-credentials"]=true	bind the local guard
skipped job	.workflow.jobs["validate-retired-links"].if="false"	execute without write
write access	.workflow.jobs["validate-retired-links"].permissions.contents="write"	execute without write
disabled caller	.action.runs.steps |= map(if .id == "links" then .with.enabled="false" else . end)	explicitly enabled
action bypass	.action.runs.steps |= map(if .id == "links" then del(.uses) | .run="echo PASS" | .shell="bash" else . end)	explicitly enabled
lost success proof	.action.runs.steps |= map(select(.name != "Require a complete scan"))	complete validation
dirty missing-config control	.action.runs.steps |= map(if .id == "missing-config" then .with["working-directory"]="${{ steps.fixture.outputs.directory }}" else . end)	clean consumer root
missing rejection condition	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then del(.if) else . end)	negative rejection proof
skipped rejection proof	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then .if="false" else . end)	negative rejection proof
ignored rejection failure	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then .["continue-on-error"]=true else . end)	negative rejection proof
missing link outcome	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then del(.env.LINK_OUTCOME) else . end)	negative rejection proof
misbound link outcome	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then .env.LINK_OUTCOME="${{ steps.links.outcome }}" else . end)	negative rejection proof
missing link validation	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then del(.env.LINK_VALIDATED) else . end)	negative rejection proof
misbound link validation	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then .env.LINK_VALIDATED="${{ steps.links.outputs.validated }}" else . end)	negative rejection proof
missing config outcome	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then del(.env.CONFIG_OUTCOME) else . end)	negative rejection proof
misbound config outcome	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then .env.CONFIG_OUTCOME="${{ steps.negative.outcome }}" else . end)	negative rejection proof
missing config validation	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then del(.env.CONFIG_VALIDATED) else . end)	negative rejection proof
misbound config validation	.action.runs.steps |= map(if .name == "Require both negative controls to fail without success output" then .env.CONFIG_VALIDATED="${{ steps.negative.outputs.validated }}" else . end)	negative rejection proof
missing retired-link fixture	.action.runs.steps |= map(if .id == "negative" then del(.with["working-directory"]) else . end)	retired-link control
misbound retired-link fixture	.action.runs.steps |= map(if .id == "negative" then .with["working-directory"]="." else . end)	retired-link control
missing retired-link continuation	.action.runs.steps |= map(if .id == "negative" then del(.["continue-on-error"]) else . end)	retired-link control
disabled retired-link continuation	.action.runs.steps |= map(if .id == "negative" then .["continue-on-error"]=false else . end)	retired-link control
skipped aggregate	.ci.jobs["ci-required-checks"].if="false"	gate required CI
lost aggregate condition	del(.ci.jobs["ci-required-checks"].if)	gate required CI
lost aggregation	.ci.jobs["ci-required-checks"].needs |= map(select(. != "validate-retired-links"))	gate required CI
lost result	.ci.jobs["ci-required-checks"].steps |= map(if .with["job-results"] then .with["job-results"] |= gsub("needs.validate-retired-links.result";"needs.other.result") else . end)	gate required CI
CASES
echo "PASS: consumer wiring rejects $count independent regressions"

# Moving the steps must not turn their rejection proof into a green no-op.
jq -er '.action.runs.steps[] | select(.name == "Require both negative controls to fail without success output") | .run' \
  "$work/bundle.json" >"$work/rejection-proof.sh"
count=0
for link in failure success skipped cancelled; do
  for config in failure success skipped cancelled; do
    for link_validated in '' true; do
      for config_validated in '' true; do
        expected=1
        [[ "$link:$config:$link_validated:$config_validated" != failure:failure:: ]] || expected=0
        actual=0
        LINK_OUTCOME="$link" CONFIG_OUTCOME="$config" LINK_VALIDATED="$link_validated" CONFIG_VALIDATED="$config_validated" \
          bash -euo pipefail "$work/rejection-proof.sh" >"$work/result" 2>&1 || actual=$?
        [[ "$actual" == "$expected" ]] || { echo 'FAIL: negative control proof accepted incomplete rejection' >&2; exit 1; }
        count=$((count + 1))
      done
    done
  done
done
echo "PASS: actual negative-control reducer rejects $((count - 1)) incomplete outcomes"

[[ $# == 0 ]] && exit 0
[[ $# == 1 && -x "$1" ]] || { echo 'Expected one executable released validator' >&2; exit 1; }
validator="$1"
"$validator" --root "$root" >"$work/clean.log" 2>&1
cat "$work/clean.log"
mkdir -p "$work/fixture/.github"
cp "$root/README.md" "$root/AGENTS.md" "$work/fixture/"
cp "$root/.github/retired-repo-links.json" "$work/fixture/.github/"
printf '\n[Retired-link fixture](https://github.com/devantler-tech/reusable-workflows)\n' >>"$work/fixture/README.md"
result=0
"$validator" --root "$work/fixture" >"$work/negative.log" 2>&1 || result=$?
[[ "$result" == 1 ]]
grep -E '^README.md:[0-9]+: link targets retired repository devantler-tech/reusable-workflows$' "$work/negative.log"
result=0
"$validator" --root "$root" --config .github/missing-retired-repo-links.json >"$work/missing.log" 2>&1 || result=$?
[[ "$result" == 2 ]]
grep -qF 'configuration' "$work/missing.log"
echo 'PASS: released validator accepts clean documentation and rejects the seeded link and missing configuration'
