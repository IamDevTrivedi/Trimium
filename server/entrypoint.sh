#!/bin/sh
set -e

echo "[entrypoint] Starting GeoIP download..."
bun run download:geoip
echo "[entrypoint] GeoIP download complete."
exec bun run start
