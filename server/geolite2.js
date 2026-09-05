import path from "path";
import fs from "fs";

const __dirname = import.meta.dir;

const LICENSE_KEY = process.env.MAXMIND_LICENSE_KEY;
const EDITION_ID = "GeoLite2-City";
const DOWNLOAD_URL = `https://download.maxmind.com/app/geoip_download?edition_id=${EDITION_ID}&license_key=${LICENSE_KEY}&suffix=tar.gz`;

const TARGET_DIR = path.join(__dirname, "src", "constants");
const TARGET_FILE = path.join(TARGET_DIR, "GeoLite2-City.mmdb");

try {
    if (!LICENSE_KEY) {
        throw new Error("MAXMIND_LICENSE_KEY environment variable is not set!");
    }

    const response = await fetch(DOWNLOAD_URL);
    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const gzipped = Buffer.from(await response.arrayBuffer());
    const tarBuffer = Buffer.from(Bun.gunzipSync(gzipped));

    let offset = 0;
    let mmdbBuffer = null;

    while (offset + 512 <= tarBuffer.length) {
        const header = tarBuffer.subarray(offset, offset + 512);
        if (header.every((byte) => byte === 0)) break;

        const name = header.toString("utf8", 0, 100).replace(/\0.*$/, "").trim();
        const sizeField = header.toString("utf8", 124, 136).replace(/\0.*$/, "").trim();
        const size = sizeField ? parseInt(sizeField, 8) : 0;
        const typeFlag = header.toString("utf8", 156, 157);

        offset += 512;

        if ((typeFlag === "0" || typeFlag === "\0") && name.endsWith(".mmdb")) {
            mmdbBuffer = Buffer.from(tarBuffer.subarray(offset, offset + size));
            break;
        }

        offset += Math.ceil(size / 512) * 512;
    }

    if (!mmdbBuffer) {
        throw new Error("MMDB file not found in archive");
    }

    fs.mkdirSync(TARGET_DIR, { recursive: true });
    await Bun.write(TARGET_FILE, mmdbBuffer);

    console.log("Success: GeoLite2-City database updated.");
    process.exit(0);
} catch (error) {
    console.error(`Fail: ${error.message}`);
    process.exit(1);
}
