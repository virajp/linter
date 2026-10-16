#!/usr/bin/env bash
# Fails when a packed tarball is missing a platform's native binary for
# @astrojs/compiler-binding.
#
# A native addon bundled from a host-only install ships a tarball that runs on
# the packing platform alone (see CLAUDE.md). release.yml and the p:preflight
# task both run this, so the matrix only has to prove the binaries load.
#
#   bash .github/scripts/check-bindings.sh ./askviraj-linter-1.2.3.tgz
#
# Skipped: wasm32 (no native .node file) and android (not in
# supportedArchitectures -- no runner in the matrix can load it).

set -euo pipefail

TARBALL="$1"
CONTENTS="$(tar tzf "$TARBALL")"
EXPECTED="$(node -e "
  const pkg = require('./node_modules/@astrojs/compiler-binding/package.json');
  console.log(
    Object.keys(pkg.optionalDependencies)
      .filter((name) => !/wasm32|android/.test(name))
      .join('\n'),
  );
")"
missing=0
for pkg in $EXPECTED; do
  if ! grep -q "^package/node_modules/$pkg/.*\.node\$" <<< "$CONTENTS"; then
    echo "::error::$TARBALL is missing the native binary for $pkg"
    missing=1
  fi
done
[ "$missing" -eq 0 ]
echo "all native bindings are bundled in $TARBALL"
