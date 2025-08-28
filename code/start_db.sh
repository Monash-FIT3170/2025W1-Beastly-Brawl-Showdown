#!/bin/sh

PLATFORM=$1

echo "[start_db.sh] Starting MongoDB..."

if [ "$PLATFORM" = "macOS" ]; then
    # Start MongoDB on macOS using Homebrew services
    brew services start mongodb-community
elif [ "$PLATFORM" = "Linux" ]; then
    # Start MongoDB on Linux or WSL using systemctl
    sudo systemctl start mongod
else
    echo "[start_db.sh] Unsupported platform: $PLATFORM"
    exit 1
fi

echo "[start_db.sh] MongoDB is ready."
