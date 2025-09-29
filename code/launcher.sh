#!/bin/sh
set -e

# ----------------------------
# Detect OS platform
# ----------------------------
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

# ----------------------------
# Set base directory (script location)
# ----------------------------
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "[launcher] Base directory: $BASE_DIR"

# ----------------------------
# Start MongoDB
# ----------------------------
echo "[launcher] Starting MongoDB..."
sh "$BASE_DIR/start_db.sh" "$PLATFORM" &

# Wait for MongoDB to become available
echo "[launcher] Waiting for MongoDB to be ready..."
until mongosh --eval "db.stats()" >/dev/null 2>&1; do
  sleep 1
done
echo "[launcher] MongoDB is up."

# ----------------------------
# Start Server Locator
# ----------------------------
SERVER_LOCATOR_DIR="$BASE_DIR/server-locator"
echo "[launcher] Starting game server in $SERVER_LOCATOR_DIR..."
(
  cd "$SERVER_LOCATOR_DIR"
  # Check if ts-node is installed
  if [ ! -f "./node_modules/.bin/ts-node" ]; then
    echo "ts-node not found locally. Installing..."
    npm install --save-dev ts-node typescript
else
    echo "ts-node is already installed locally."
fi
  npx ts-node ./src/app.ts
) &

# ----------------------------
# Start Game Server
# ----------------------------
GAME_SERVER_DIR="$BASE_DIR/game-server-v2"
echo "[launcher] Starting game server in $GAME_SERVER_DIR..."
(
  cd "$GAME_SERVER_DIR"
  # Check if ts-node is installed
  if [ ! -f "./node_modules/.bin/ts-node" ]; then
    echo "ts-node not found locally. Installing..."
    npm install --save-dev ts-node typescript
else
    echo "ts-node is already installed locally."
fi
  npx ts-node main.ts
) &

# Wait for server readiness signal
READY_FILE="$GAME_SERVER_DIR/server_ready.flag"
echo "[launcher] Waiting for game server to signal readiness..."
until [ -f "$READY_FILE" ]; do
  sleep 1
done
rm -f "$READY_FILE"
echo "[launcher] Game server is ready."

# ----------------------------
# Start React App
# ----------------------------
REACT_DIR="$BASE_DIR/bbs"
echo "[launcher] Starting React app in $REACT_DIR..."
(
  cd "$REACT_DIR"
  
  # Check for missing npm packages
  missing=$(meteor npm ls --depth=0 2>&1 | grep "missing:" || true)
  if [ -n "$missing" ]; then
    echo "[launcher] Missing packages detected:"
    echo "$missing"
    echo "[launcher] Running 'npm install'..."
    npm install
  else
    echo "[launcher] All packages installed."
  fi

  # Launch Meteor
  npm run dev
) &

# ----------------------------
# Wait for all background processes
# ----------------------------
echo "[launcher] All processes started. Press Ctrl+C to stop."
wait
