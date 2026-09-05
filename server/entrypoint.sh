#!/bin/sh
set -e

bun run download:geoip
exec bun run start