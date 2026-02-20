#!/usr/bin/env bash
set -e

# Simple integration test: posts sample files to the backend and prints response
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_URL=${1:-http://127.0.0.1:5000}

echo "Posting sample files to ${BACKEND_URL}/detect-mood..."
RESP=$(curl -s -F "image=@${ROOT_DIR}/samples/test_face.jpg" -F "eeg=@${ROOT_DIR}/samples/test_eeg.csv" "${BACKEND_URL}/detect-mood")

if command -v jq >/dev/null 2>&1; then
  echo "$RESP" | jq
elif command -v python >/dev/null 2>&1; then
  echo "$RESP" | python -m json.tool || echo "$RESP"
else
  echo "$RESP"
fi

echo "Done. If you see JSON with final_mood, test passed."