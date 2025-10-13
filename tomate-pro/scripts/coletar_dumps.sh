#!/usr/bin/env bash
set -euo pipefail
stdin="$(cat)"
artifactsDir="$(echo "$stdin" | jq -r '.artifactsDir // "."')"
echo "diagnostics" > "$artifactsDir/diagnostics.txt" || true
cat <<EOF
{"logs":["diagnóstico coletado"],"artifacts":["diagnostics.txt"]}
EOF
