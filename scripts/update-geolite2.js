import path from "path";
import { $ } from "bun";

const __dirname = import.meta.dir;

const LICENSE_KEY = process.env.MAXMIND_LICENSE_KEY;
const EDITION_ID = "GeoLite2-City";
const DOWNLOAD_URL = `https://download.maxmind.com/app/geoip_download?edition_id=${EDITION_ID}&license_key=${LICENSE_KEY}&suffix=tar.gz`;

const TMP_DIR = path.join(__dirname, "..", "tmp");
const TMP_FILE = path.join(TMP_DIR, "GeoLite2-City.tar.gz");
const TARGET_DIR = path.join(__dirname, "..", "server", "src", "constants");
const TARGET_FILE = path.join(TARGET_DIR, "GeoLite2-City.mmdb");

try {
    if (!LICENSE_KEY) {
        throw new Error("MAXMIND_LICENSE_KEY environment variable is not set!");
    }

    await $`mkdir -p ${TMP_DIR} ${TARGET_DIR}`.quiet();
    await $`curl -L -o ${TMP_FILE} ${DOWNLOAD_URL}`.quiet();
    await $`tar -xzf ${TMP_FILE} -C ${TMP_DIR}`.quiet();

    const findResult = await $`find ${TMP_DIR} -name "*.mmdb" -print -quit`.quiet();
    const mmdbPath = findResult.stdout.toString().trim();
    if (!mmdbPath) {
        throw new Error("MMDB file not found in archive");
    }

    await $`cp -f ${mmdbPath} ${TARGET_FILE}`.quiet();
    await $`rm -rf ${TMP_DIR}`.quiet();
    console.log("Success: GeoLite2-City database updated.");
    process.exit(0);
} catch (error) {
    await $`rm -rf ${TMP_DIR}`.quiet().catch(() => {});
    console.error(`Fail: ${error.message}`);
    process.exit(1);
}
