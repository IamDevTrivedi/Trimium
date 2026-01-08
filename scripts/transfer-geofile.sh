#!/usr/bin/env bash

# Run this script from the project root directory
# Usage: copies the ./server/src/contants/GeoLite2-City.mmdb to ./server/build/contants/GeoLite2-City.mmdb

cp "./server/src/constants/GeoLite2-City.mmdb" "./server/build/constants/GeoLite2-City.mmdb"
echo "GeoLite2-City.mmdb has been copied to the build directory."