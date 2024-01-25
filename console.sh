#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd -- "$SCRIPT_DIR"


IMAGE_NAME="$(basename "$SCRIPT_DIR")_dev"


docker buildx build \
  -f Dockerfile.dev \
  -t "$IMAGE_NAME" \
  .

docker run \
  -it \
  --rm \
  --mount "type=bind,source=$(pwd),target=/usr/src/app" \
  "$@" \
  "$IMAGE_NAME" bash
