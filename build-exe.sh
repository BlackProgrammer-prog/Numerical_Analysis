#!/usr/bin/env bash
# Build and verify the Windows EXE from Git Bash.
set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) ;;
  *) echo "Run this script in Git Bash on Windows to build a Windows EXE." >&2; exit 1 ;;
esac

for tool in powershell.exe node npm; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Required command not found: $tool" >&2
    exit 1
  fi
done

# Reuse the same dependency installation, frontend build, packaging and
# packaged API/UI checks as the PowerShell entry point.
exec powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w "$PROJECT_ROOT/build-exe.ps1")"
