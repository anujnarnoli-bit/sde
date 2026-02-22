#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8000}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

node server.js > /tmp/sde_server_runtime.log 2>&1 &
SERVER_PID=$!

# wait for server readiness
for _ in {1..20}; do
  if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

if ! curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
  echo "Server failed to start on port ${PORT}" >&2
  exit 1
fi

echo "Server started on http://127.0.0.1:${PORT}"
echo "Creating public tunnel (localhost.run)..."

echo "Tip: keep this process running to keep the public URL alive. Press Ctrl+C to stop."
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:${PORT} nokey@localhost.run
