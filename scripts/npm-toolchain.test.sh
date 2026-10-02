#!/usr/bin/env sh
#
# Every place that installs this site uses the npm major that writes package-lock.json (#250).
#
# WHY: Dependabot writes the lockfile with npm 11, its default for a version-3 lockfile. npm 10 and
# npm 11 disagree about which optional peer entries a lockfile must hold, so a lockfile one major
# writes fails the other major's `npm ci` sync check: while CI ran Node 22 (npm 10), every
# Dependabot npm update arrived red and needed a hand-regenerated lockfile. package.json declares
# the npm major in devEngines.packageManager, and npm refuses to install or run a script with any
# other major. This test keeps every workflow job that runs npm, and the Docker build, on a Node
# line whose bundled npm is that major, so none of them can drift back unnoticed — including the
# release image build, which only runs on a tag.
#
# CHECKS
#   1. package.json declares devEngines.packageManager as npm "^<major>.0.0" with onFail "error".
#   2. Every workflow job with a step that runs npm or npx has exactly one actions/setup-node step,
#      before its first npm or npx step and without an if: or continue-on-error, with an explicit
#      node-version on a Node line whose bundled npm is that major. The known jobs must all be
#      found, so an empty discovery cannot pass.
#   3. Every node base image in the Dockerfile names such a Node line, and there is at least one.
#   4. CI runs this test, with no if: or continue-on-error on its job or step, in a job whose result
#      CI - Required Checks reports.
#
# The real files must pass; then mutated copies prove each check rejects the drift it exists for,
# each for its own reason.

set -eu

script_dir=$(CDPATH='' cd -P -- "$(dirname -- "$0")" && pwd)
repo_root=$(dirname -- "$script_dir")
work=$(mktemp -d)
# An abort must not read as a pass: some shells report exit 0 from an EXIT trap after set -e fires.
completed=0
trap 'rm -rf "$work"; [ "$completed" -eq 1 ] || exit 1' EXIT
tab=$(printf '\t')

fail() {
	printf 'FAIL: %s\n' "$*" >&2
	exit 1
}

command -v yq >/dev/null 2>&1 || fail 'yq is required to read the workflows'
command -v jq >/dev/null 2>&1 || fail 'jq is required to read package.json'

# The npm major each Node release line bundles, from the Node.js release index
# (https://nodejs.org/dist/index.json). An unlisted line fails closed: confirm the npm major it
# bundles before adding it. A line can still move to a new npm major mid-line (Node 18 and 20 both
# did); devEngines stops that at install time with a clear error, and this table is updated then.
bundled_npm_major() {
	case $1 in
	22) printf '10\n' ;;
	24 | 26) printf '11\n' ;;
	*) return 1 ;;
	esac
}

# Jobs that must be discovered as running npm, as <workflow file>:<job id>.
required_jobs='ci.yaml:lint ci.yaml:check ci.yaml:test ci.yaml:e2e ci.yaml:build ci.yaml:lighthouse'

test_command='sh scripts/npm-toolchain.test.sh'

# One row per job with a step that runs npm or npx: job id, setup-node step count, the
# node-version and node-version-file of the first setup-node step, that step's index, the index of
# the first npm or npx step, and whether the setup-node step may not take effect (an `if:` or a
# continue-on-error). "-" stands for an absent value, because `read` collapses empty tab-separated
# fields. $setup[0] is read only when $setup is non-empty: yq inserts an element when it indexes an
# empty array, which would change the count.
# shellcheck disable=SC2016 # $job, $npm, $setup, $count and $first are yq variables, not shell expansions.
jobs_query='
  [.jobs // {} | to_entries | .[] |
    .key as $job |
    [.value.steps // [] | to_entries | .[] |
      select((.value.run // "") | test("(^|[\\s;&|(])(npm|npx)(\\s|$)")) | .key] as $npm |
    select($npm | length > 0) |
    [.value.steps // [] | to_entries | .[] | select((.value.uses // "") | test("^actions/setup-node@"))] as $setup |
    ($setup | length) as $count |
    (if $count > 0 then $setup[0] else {"key": "-", "value": {}} end) as $first |
    [$job, $count, ($first.value.with."node-version" // "-"), ($first.value.with."node-version-file" // "-"),
     $first.key, $npm[0],
     (($first.value | has("if")) or (($first.value."continue-on-error" // false) != false))]] | .[]
'

# validate <package.json> <workflows dir> <Dockerfile>: exits non-zero on the first violation.
validate() {
	package_json=$1
	workflows_dir=$2
	dockerfile=$3

	pm_type=$(jq -r '.devEngines.packageManager | type' "$package_json") ||
		fail "cannot parse $package_json"
	[ "$pm_type" = object ] ||
		fail 'package.json declares no devEngines.packageManager entry for npm'
	pm_name=$(jq -r '.devEngines.packageManager.name // ""' "$package_json")
	pm_version=$(jq -r '.devEngines.packageManager.version // ""' "$package_json")
	pm_on_fail=$(jq -r '.devEngines.packageManager.onFail // ""' "$package_json")
	[ "$pm_name" = npm ] ||
		fail "devEngines.packageManager names '$pm_name', not npm"
	[ "$pm_on_fail" = error ] ||
		fail "devEngines.packageManager onFail is '$pm_on_fail'; it must be 'error' so another npm major stops before it reads the lockfile"
	declared_major=$(printf '%s\n' "$pm_version" | sed -n 's/^\^\([1-9][0-9]*\)\.0\.0$/\1/p')
	[ -n "$declared_major" ] ||
		fail "devEngines.packageManager version '$pm_version' is not one npm major written as ^<major>.0.0"

	found=' '
	for workflow in "$workflows_dir"/*.yaml "$workflows_dir"/*.yml; do
		[ -f "$workflow" ] || continue
		base=$(basename -- "$workflow")
		rows=$(yq -o=tsv "$jobs_query" "$workflow") || fail "cannot parse $base"
		while IFS=$tab read -r job count node_version node_version_file setup_index npm_index setup_optional; do
			[ -n "$job" ] || continue
			found="$found$base:$job "
			[ "$count" = 1 ] ||
				fail "$base:$job runs npm but has $count actions/setup-node steps; it needs exactly one"
			# A setup-node step after the first npm step, or one that may be skipped or fail
			# silently, leaves npm on the runner's own Node installation.
			[ "$setup_index" -lt "$npm_index" ] ||
				fail "$base:$job runs npm in step $((npm_index + 1)), before its actions/setup-node step (step $((setup_index + 1)))"
			[ "$setup_optional" = false ] ||
				fail "$base:$job's actions/setup-node step sets if: or continue-on-error, so npm may run on the runner's own Node"
			{ [ "$node_version_file" = - ] && [ "$node_version" != - ]; } ||
				fail "$base:$job must pin node-version explicitly, so the npm major it installs with is reviewable"
			line=$(printf '%s\n' "$node_version" | sed -n 's/^v\{0,1\}\([0-9][0-9]*\)\(\..*\)\{0,1\}$/\1/p')
			[ -n "$line" ] ||
				fail "$base:$job node-version '$node_version' does not name a Node release line"
			npm_major=$(bundled_npm_major "$line") ||
				fail "$base:$job uses Node $line, whose bundled npm major this test does not know yet"
			[ "$npm_major" = "$declared_major" ] ||
				fail "$base:$job sets up Node $node_version, which bundles npm $npm_major; package.json declares npm $declared_major"
		done <<EOF
$rows
EOF
	done
	for required in $required_jobs; do
		case $found in
		*" $required "*) ;;
		*) fail "$required was not found as a job that runs npm" ;;
		esac
	done

	[ -f "$dockerfile" ] || fail "cannot read $dockerfile"
	images=$(awk 'toupper($1) == "FROM" { for (i = 2; i <= NF; i++) if ($i !~ /^--/) { print $i; break } }' \
		"$dockerfile")
	node_images=0
	for image in $images; do
		case ${image#docker.io/} in
		node | node:* | node@* | library/node | library/node:* | library/node@*) ;;
		*) continue ;;
		esac
		node_images=$((node_images + 1))
		# Read the Node line from the tag. With a digest, Docker builds from the digest, which
		# cannot be resolved offline; the build's own `npm ci` checks it instead. package.json is
		# copied in before it, so npm 10.9 and later stop with EBADDEVENGINES on any other major,
		# and earlier npm 10 releases reject the lockfile npm 11 writes. Container Smoke runs that
		# build on every pull request.
		tag=${image%%@*}
		case $tag in
		*:*) tag=${tag##*:} ;;
		*) tag= ;;
		esac
		line=$(printf '%s\n' "$tag" | sed -n 's/^\([0-9][0-9]*\)\([.-].*\)\{0,1\}$/\1/p')
		[ -n "$line" ] ||
			fail "Dockerfile base image '$image' does not name a Node release line"
		npm_major=$(bundled_npm_major "$line") ||
			fail "Dockerfile base image '$image' uses Node $line, whose bundled npm major this test does not know yet"
		[ "$npm_major" = "$declared_major" ] ||
			fail "Dockerfile base image '$image' bundles npm $npm_major; package.json declares npm $declared_major"
	done
	[ "$node_images" -gt 0 ] ||
		fail 'the Dockerfile has no node base image, but its build installs with npm'

	ci=$workflows_dir/ci.yaml
	gate_job=$(TEST_COMMAND=$test_command yq -r '
	  [.jobs // {} | to_entries | .[] | select([.value.steps[]? | select(.run == strenv(TEST_COMMAND))] | length > 0) | .key] | .[0] // ""
	' "$ci") || fail 'cannot parse ci.yaml'
	[ -n "$gate_job" ] ||
		fail "ci.yaml has no job that runs '$test_command'"
	# A condition can skip the test, and continue-on-error lets a failing test pass the job.
	# shellcheck disable=SC2016 # $j and $s are yq variables, not shell expansions.
	gate_flags=$(GATE_JOB=$gate_job TEST_COMMAND=$test_command yq -o=tsv '
	  [.jobs | to_entries | .[] | select(.key == strenv(GATE_JOB)) | .value as $j |
	    [$j.steps[] | select(.run == strenv(TEST_COMMAND))] as $s |
	    [($j | has("if")), (($j."continue-on-error" // false) != false),
	     ($s[0] | has("if")), (($s[0]."continue-on-error" // false) != false)]] | .[]
	' "$ci") || fail 'cannot parse ci.yaml'
	IFS=$tab read -r job_if job_continue step_if step_continue <<EOF
$gate_flags
EOF
	[ "$job_if" = false ] ||
		fail "ci.yaml job '$gate_job' sets if:, so the test may not run"
	[ "$job_continue" = false ] ||
		fail "ci.yaml job '$gate_job' sets continue-on-error, so a failing test may not fail the required check"
	[ "$step_if" = false ] ||
		fail "the ci.yaml step that runs '$test_command' sets if:, so the test may not run"
	[ "$step_continue" = false ] ||
		fail "the ci.yaml step that runs '$test_command' sets continue-on-error, so a failing test would not fail its job"
	GATE_JOB=$gate_job yq -e '.jobs."ci-required-checks".needs | any_c(. == strenv(GATE_JOB))' "$ci" \
		>/dev/null 2>&1 ||
		fail "ci.yaml job '$gate_job' is not a dependency of CI - Required Checks, so its failure would not block a merge"
	GATE_JOB=$gate_job yq -e '
	  [.jobs."ci-required-checks".steps[]? | .with."job-results" // "" | select(test("needs\\." + strenv(GATE_JOB) + "\\.result"))] | length > 0
	' "$ci" >/dev/null 2>&1 ||
		fail "CI - Required Checks does not report the result of ci.yaml job '$gate_job'"
}

validate "$repo_root/package.json" "$repo_root/.github/workflows" "$repo_root/Dockerfile"

mutations_run=0

# reset_fixture: a fresh copy of the real package.json, workflows and Dockerfile.
reset_fixture() {
	rm -rf "$work/fixture"
	mkdir -p "$work/fixture/.github"
	cp "$repo_root/package.json" "$work/fixture/package.json"
	cp -R "$repo_root/.github/workflows" "$work/fixture/.github/workflows"
	cp "$repo_root/Dockerfile" "$work/fixture/Dockerfile"
}

# mutate_json <jq filter> / mutate_ci <yq expression> / mutate_dockerfile <sed script>: edit the
# fixture copy in place.
mutate_json() {
	jq "$1" "$work/fixture/package.json" >"$work/mutant"
	mv "$work/mutant" "$work/fixture/package.json"
}
mutate_ci() {
	yq "$1" "$work/fixture/.github/workflows/ci.yaml" >"$work/mutant"
	mv "$work/mutant" "$work/fixture/.github/workflows/ci.yaml"
}
mutate_dockerfile() {
	sed "$1" "$work/fixture/Dockerfile" >"$work/mutant"
	mv "$work/mutant" "$work/fixture/Dockerfile"
}

# expect_accepted <description>: the edited fixture must still pass, so a parse that rejects
# everything cannot hide behind the rejections below.
expect_accepted() {
	mutations_run=$((mutations_run + 1))
	rejection=$( (validate "$work/fixture/package.json" "$work/fixture/.github/workflows" \
		"$work/fixture/Dockerfile") 2>&1 >/dev/null) ||
		fail "valid variant rejected: $1: $rejection"
}

# expect_rejected <description> <expected reason>: the mutated fixture must fail for that reason,
# not for any other.
expect_rejected() {
	mutations_run=$((mutations_run + 1))
	if rejection=$( (validate "$work/fixture/package.json" "$work/fixture/.github/workflows" \
		"$work/fixture/Dockerfile") 2>&1 >/dev/null); then
		fail "mutation passed: $1"
	fi
	printf '%s\n' "$rejection" | grep -qF -- "$2" ||
		fail "mutation rejected for the wrong reason: $1; expected '$2', got: $rejection"
}

reset_fixture
mutate_json 'del(.devEngines)'
expect_rejected 'no declared npm major' 'declares no devEngines.packageManager entry'

reset_fixture
mutate_json '.devEngines.packageManager.name = "pnpm"'
expect_rejected 'another package manager declared' "names 'pnpm', not npm"

reset_fixture
mutate_json '.devEngines.packageManager.onFail = "warn"'
expect_rejected 'another npm major only warns' "onFail is 'warn'"

reset_fixture
mutate_json '.devEngines.packageManager.version = ">=11"'
expect_rejected 'declared range spans npm majors' "version '>=11' is not one npm major"

reset_fixture
mutate_json '.devEngines.packageManager.version = "^10.0.0"'
expect_rejected 'declared major differs from what CI installs with' 'package.json declares npm 10'

reset_fixture
mutate_ci '.jobs.lint.steps[1].with."node-version" = 22'
expect_rejected 'one CI job back on Node 22' 'ci.yaml:lint sets up Node 22, which bundles npm 10'

reset_fixture
mutate_ci '.jobs.test.steps[1].with."node-version" = "lts/*"'
expect_rejected 'a floating Node alias' "ci.yaml:test node-version 'lts/*' does not name a Node release line"

reset_fixture
mutate_ci '.jobs.build.steps[1].with."node-version" = 27'
expect_rejected 'a Node line with an unknown npm major' 'ci.yaml:build uses Node 27, whose bundled npm major'

reset_fixture
mutate_ci 'del(.jobs.check.steps[1].with."node-version") | .jobs.check.steps[1].with."node-version-file" = "package.json"'
expect_rejected 'node-version read from a file' 'ci.yaml:check must pin node-version explicitly'

reset_fixture
mutate_ci 'del(.jobs.e2e.steps[1])'
expect_rejected 'a job that runs npm without setup-node' 'ci.yaml:e2e runs npm but has 0 actions/setup-node steps'

reset_fixture
mutate_ci '.jobs.lint.steps |= [.[0], .[2], .[1], .[3]]'
expect_rejected 'setup-node after the first npm step' \
	'ci.yaml:lint runs npm in step 2, before its actions/setup-node step (step 3)'

reset_fixture
mutate_ci '.jobs.test.steps[1].if = false'
expect_rejected 'a setup-node step that may be skipped' "ci.yaml:test's actions/setup-node step sets if: or continue-on-error"

reset_fixture
mutate_ci '.jobs.build.steps[1]."continue-on-error" = true'
expect_rejected 'a setup-node step whose failure is ignored' "ci.yaml:build's actions/setup-node step sets if: or continue-on-error"

reset_fixture
mutate_ci 'del(.jobs.lighthouse)'
expect_rejected 'a known npm job no longer discovered' 'ci.yaml:lighthouse was not found as a job that runs npm'

reset_fixture
mutate_dockerfile 's/^FROM node:[^ ]*/FROM node:22-alpine/'
expect_rejected 'the Docker build back on Node 22' "base image 'node:22-alpine' bundles npm 10"

reset_fixture
mutate_dockerfile 's/^FROM node:[^ ]*/FROM node:lts-alpine/'
expect_rejected 'a floating Docker base image tag' "base image 'node:lts-alpine' does not name a Node release line"

reset_fixture
mutate_dockerfile 's/^FROM node:[^ ]*/FROM --platform=linux\/amd64 docker.io\/library\/node:26.10.0-alpine@sha256:0/'
mutate_ci '(.jobs[].steps[]? | select((.uses // "") | test("^actions/setup-node@")) | .with."node-version") = "26.10.0"'
expect_accepted 'exact versions, a platform flag and a digest-pinned, fully qualified base image'

reset_fixture
mutate_dockerfile 's/^FROM node:[^ ]*/FROM docker.io\/library\/node:22-alpine@sha256:0/'
expect_rejected 'a fully qualified, digest-pinned base image on Node 22' \
	"base image 'docker.io/library/node:22-alpine@sha256:0' bundles npm 10"

reset_fixture
mutate_dockerfile '/^FROM node:/d'
expect_rejected 'no node base image found' 'the Dockerfile has no node base image'

reset_fixture
mutate_ci "del(.jobs[].steps[]? | select(.run == \"$test_command\"))"
expect_rejected 'CI no longer runs this test' "ci.yaml has no job that runs '$test_command'"

GATE_JOB=$(TEST_COMMAND=$test_command yq -r '
  [.jobs | to_entries | .[] | select([.value.steps[]? | select(.run == strenv(TEST_COMMAND))] | length > 0) | .key] | .[0]
' "$repo_root/.github/workflows/ci.yaml")
export GATE_JOB

reset_fixture
mutate_ci 'del(.jobs."ci-required-checks".needs[] | select(. == strenv(GATE_JOB)))'
expect_rejected 'this test no longer blocks a merge' "job '$GATE_JOB' is not a dependency of CI - Required Checks"

reset_fixture
mutate_ci '(.jobs."ci-required-checks".steps[] | select(.with."job-results" != null) | .with."job-results") |=
  sub("needs." + strenv(GATE_JOB) + ".result"; "needs." + strenv(GATE_JOB) + ".outcome")'
expect_rejected 'its result no longer reported' "does not report the result of ci.yaml job '$GATE_JOB'"

export TEST_COMMAND="$test_command"

reset_fixture
mutate_ci '.jobs[strenv(GATE_JOB)].if = false'
expect_rejected 'the test job may be skipped' "ci.yaml job '$GATE_JOB' sets if:"

reset_fixture
mutate_ci '.jobs[strenv(GATE_JOB)]."continue-on-error" = true'
expect_rejected 'the test job ignores a failure' "ci.yaml job '$GATE_JOB' sets continue-on-error"

reset_fixture
# shellcheck disable=SC2016 # ${{ false }} is a GitHub Actions expression, not a shell expansion.
mutate_ci '(.jobs[strenv(GATE_JOB)].steps[] | select(.run == strenv(TEST_COMMAND)) | .if) = "${{ false }}"'
expect_rejected 'the test step may be skipped' "the ci.yaml step that runs '$test_command' sets if:"

reset_fixture
mutate_ci '(.jobs[strenv(GATE_JOB)].steps[] | select(.run == strenv(TEST_COMMAND)) | ."continue-on-error") = true'
expect_rejected 'the test step ignores a failure' "the ci.yaml step that runs '$test_command' sets continue-on-error"

completed=1
printf 'PASS: npm toolchain contract (happy path + %s fixture cases)\n' "$mutations_run"
