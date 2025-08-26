#!/bin/sh
set -e

# Detect OS platform: macOS vs Linux (including WSL)
OS_TYPE="$(uname -s)"
case "$OS_TYPE" in
  Darwin)
    PLATFORM="macOS"
    ;;
  Linux)
    PLATFORM="Linux"
    ;;
  *)
    echo "[launcher] Unsupported OS: $OS_TYPE"
    exit 1
    ;;
esac

BASE_DIR="$(dirname "$0")"
echo "[launcher] Base directory: $BASE_DIR"

# Start MongoDB
echo "[launcher] Starting MongoDB..."
sh "$BASE_DIR/start_db.sh" "$PLATFORM" &

# Wait for Mongo to become available
echo "[start_db.sh] Waiting for MongoDB to be ready..."
# runs without output
until mongosh --eval "db.stats()" >/dev/null 2>&1; do 
  sleep 1
done
echo "[launcher] MongoDB is up."

# Start game server
echo "[launcher] Starting game server..."
( cd "$BASE_DIR/game-server-v2" && ts-node main.ts ) &

READY_FILE="$BASE_DIR/game-server-v2/server_ready.flag"
echo "[launcher] Waiting for game server to signal readiness..."
# waits until file exists
until [ -f "$READY_FILE" ]; do 
  sleep 1
done
echo "[launcher] Game server signaled readiness."
rm -f "$READY_FILE"
echo "[launcher] Removed game server readiness file."

# Start Meteor app
echo "Checking packages"
cd "$BASE_DIR/beastly-brawl-showdown"
missing=$(meteor npm ls --depth=0 2>&1 | grep "missing:" || true)
if [ -n "$missing" ]; then
  echo "Missing packages detected:"
  echo "$missing"
  echo "Running 'meteor npm install' to fix..."
  meteor npm install
else
  echo "No missing packages. Everything looks good."
fi
cd "$BASE_DIR"
echo "[launcher] Starting Meteor app..."
( cd "$BASE_DIR/beastly-brawl-showdown" && sh run.sh ) &


# Wait for all background processes
echo "[launcher] All processes started. Press Ctrl+C to stop."
wait
