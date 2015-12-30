#!/bin/bash

set -euo pipefail

if [ "${PROMISES}" = "bluebird" ]; then
  npm install bluebird
fi
