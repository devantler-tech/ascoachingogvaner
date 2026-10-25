#!/usr/bin/env bash
# Exercise real cold-start tests beneath another checkout's TypeScript config.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
fixture="$scratch/parent/.codex/worktrees/nested checkout"
mkdir -p "$fixture"

# Copy tracked working-tree bytes, including an uncommitted candidate fix.
# Dependencies and optimizer caches are created fresh inside the fixture.
git -C "$root" ls-files -z |
  tar -C "$root" --null -T - -cf - |
  tar -C "$fixture" -xf -
cp "$root/tsconfig.json" "$scratch/parent/tsconfig.json"

cd "$fixture"
npm ci --prefer-offline --no-audit --no-fund
npm test
printf 'PASS: cold unit suite inside a nested checkout with a parent tsconfig\n'
