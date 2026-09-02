import path from "path";
import { $ } from "bun";

const __dirname = import.meta.dir;

const LICENSE_KEY = process.env.MAXMIND_LICENSE_KEY;
const EDITION_ID = "GeoLite2-City";
const DOWNLOAD_URL = `https://download.maxmind.com/app/geoip_download?edition_id=${EDITION_ID}&license_key=${LICENSE_KEY}&suffix=tar.gz`;

const TEMP_DIR = path.join(__dirname, "..", "temp");
const TEMP_FILE = path.join(TEMP_DIR, "GeoLite2-City.tar.gz");
const TARGET_DIR = path.join(__dirname, "..", "server", "src", "constants");
const TARGET_FILE = path.join(TARGET_DIR, "GeoLite2-City.mmdb");
const DIST_TARGET_DIR = path.join(__dirname, "..", "server", "dist", "constants");
const DIST_TARGET_FILE = path.join(DIST_TARGET_DIR, "GeoLite2-City.mmdb");

try {
    if (!LICENSE_KEY) {
        throw new Error("MAXMIND_LICENSE_KEY environment variable is not set!");
    }

    await $`mkdir -p ${TEMP_DIR} ${TARGET_DIR} ${DIST_TARGET_DIR}`.quiet();
    await $`curl -L -o ${TEMP_FILE} ${DOWNLOAD_URL}`.quiet();
    await $`tar -xzf ${TEMP_FILE} -C ${TEMP_DIR}`.quiet();
    const findResult = await $`find ${TEMP_DIR} -name "*.mmdb" -print -quit`.quiet();
    const mmdbPath = findResult.stdout.toString().trim();
    if (!mmdbPath) {
        throw new Error("MMDB file not found in archive");
    }

    const targetExists = await $`test -f ${TARGET_FILE}`.quiet().then(() => true).catch(() => false);
    if (targetExists) {
        await $`cp ${TARGET_FILE} ${TARGET_FILE}.backup`.quiet();
    }

    await $`cp ${mmdbPath} ${TARGET_FILE}`.quiet();
    await $`cp ${mmdbPath} ${DIST_TARGET_FILE}`.quiet();

    await $`rm -rf ${TEMP_DIR}`.quiet();
    console.log("Success: GeoLite2-City database updated.");
    process.exit(0);
} catch (error) {
    await $`rm -rf ${TEMP_DIR}`.quiet().catch(() => { });
    console.error(`Fail: ${error.message}`);
    process.exit(1);
}