#!/usr/bin/env bash
# Start the local FastAPI backend and Vite frontend together.
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
  if [[ ! "$port" =~ ^[0-9]{1,5}$ ]] || (( 10#$port < 1 || 10#$port > 65535 )); then
    echo "Invalid port: $port (expected 1-65535)." >&2
    exit 1
  fi
done
if [[ "$BACKEND_PORT" == "$FRONTEND_PORT" ]]; then
  echo "Backend and frontend must use different ports." >&2
  exit 1
fi

for command_name in node npm; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing $command_name. Install Node.js (22.12+ recommended) and reopen your terminal." >&2
    exit 1
  fi
done

if [[ -x .venv/Scripts/python.exe ]]; then
  PYTHON=("$ROOT/.venv/Scripts/python.exe")
elif [[ -x .venv/bin/python ]]; then
  PYTHON=("$ROOT/.venv/bin/python")
else
  PYTHON=()
  for candidate in python3 python; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(sys.version_info < (3, 10))' 2>/dev/null; then
      PYTHON=("$candidate")
      break
    fi
  done
  if [[ ${#PYTHON[@]} -eq 0 ]] && command -v py >/dev/null 2>&1 && py -3 -c 'import sys; sys.exit(sys.version_info < (3, 10))' 2>/dev/null; then
    PYTHON=(py -3)
  fi
  if [[ ${#PYTHON[@]} -eq 0 ]]; then
    echo "Python 3.10+ is required. Install Python and reopen your terminal." >&2
    exit 1
  fi
  echo "Creating .venv ..."
  "${PYTHON[@]}" -m venv .venv
  if [[ -x .venv/Scripts/python.exe ]]; then
    PYTHON=("$ROOT/.venv/Scripts/python.exe")
  else
    PYTHON=("$ROOT/.venv/bin/python")
  fi
fi

echo "Checking backend dependencies ..."
"${PYTHON[@]}" -m pip install -r requirements.txt

if [[ ! -f frontend/node_modules/vite/bin/vite.js ]]; then
  echo "Installing frontend dependencies ..."
  (cd frontend && npm ci)
fi

# Explicit local endpoints override any production URL in frontend/.env.
export VITE_API_URL="http://localhost:$BACKEND_PORT"
export CORS_ORIGINS="http://localhost:$FRONTEND_PORT,http://127.0.0.1:$FRONTEND_PORT${CORS_ORIGINS:+,$CORS_ORIGINS}"

# Separate process groups let Ctrl+C close reload workers as well as the servers.
set -m
SERVER_PIDS=()
cleanup() {
  trap - EXIT INT TERM
  echo
  echo "Stopping backend and frontend ..."
  for server_pid in "${SERVER_PIDS[@]}"; do
    kill -TERM -- "-$server_pid" 2>/dev/null || kill -TERM "$server_pid" 2>/dev/null || true
  done
  for server_pid in "${SERVER_PIDS[@]}"; do
    wait "$server_pid" 2>/dev/null || true
  done
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

"${PYTHON[@]}" -m uvicorn backend.main:app --reload --host 127.0.0.1 --port "$BACKEND_PORT" &
SERVER_PIDS+=("$!")
(
  cd "$ROOT/frontend"
  exec node node_modules/vite/bin/vite.js dev --host 127.0.0.1 --port "$FRONTEND_PORT" --strictPort
) &
SERVER_PIDS+=("$!")

echo
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Swagger:  http://localhost:$BACKEND_PORT/docs"
echo "Press Ctrl+C to stop both servers."
echo

# Compatible with Bash 3.2 too (no wait -n required).
while true; do
  for server_pid in "${SERVER_PIDS[@]}"; do
    if ! kill -0 "$server_pid" 2>/dev/null; then
      status=0
      wait "$server_pid" || status=$?
      echo "A server exited (status $status); stopping the project." >&2
      exit "${status:-1}"
    fi
  done
  sleep 1
done
