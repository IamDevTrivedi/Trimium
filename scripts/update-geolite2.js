// Not a StandAlone Script: Requires tar and dotenv packages at the root level

import fs from "fs";
import path from "path";
import https from "https";
import * as tar from "tar";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "..", ".env"),
});

const LICENSE_KEY = process.env.MAXMIND_LICENSE_KEY;
const EDITION_ID = "GeoLite2-City";
const DOWNLOAD_URL = `https://download.maxmind.com/app/geoip_download?edition_id=${EDITION_ID}&license_key=${LICENSE_KEY}&suffix=tar.gz`;

const TEMP_DIR = path.join(__dirname, "..", "temp");
const TEMP_FILE = path.join(TEMP_DIR, "GeoLite2-City.tar.gz");

const TARGET_DIR = path.join(__dirname, "..", "server", "src", "constants");
const TARGET_FILE = path.join(TARGET_DIR, "GeoLite2-City.mmdb");

const BUILD_TARGET_DIR = path.join(__dirname, "..", "server", "build", "constants");
const BUILD_TARGET_FILE = path.join(BUILD_TARGET_DIR, "GeoLite2-City.mmdb");

function downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination);

        https
            .get(url, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    return downloadFile(response.headers.location, destination)
                        .then(resolve)
                        .catch(reject);
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
                    return;
                }

                const totalSize = parseInt(response.headers["content-length"], 10);
                let downloadedSize = 0;

                response.on("data", (chunk) => {
                    downloadedSize += chunk.length;
                    const progress = ((downloadedSize / totalSize) * 100).toFixed(2);
                    process.stdout.write(`\rDownloading: ${progress}%`);
                });

                response.pipe(file);

                file.on("finish", () => {
                    file.close();
                    console.log("\nDownload completed!");
                    resolve();
                });
            })
            .on("error", (err) => {
                fs.unlink(destination, () => {});
                reject(err);
            });

        file.on("error", (err) => {
            fs.unlink(destination, () => {});
            reject(err);
        });
    });
}

async function extractMmdbFile(tarFilePath, extractTo) {
    console.log("Extracting archive...");

    await tar.x({
        file: tarFilePath,
        cwd: extractTo,
    });

    const files = fs.readdirSync(extractTo);
    let mmdbPath = null;

    for (const file of files) {
        const fullPath = path.join(extractTo, file);
        if (fs.statSync(fullPath).isDirectory()) {
            const subFiles = fs.readdirSync(fullPath);
            const mmdbFile = subFiles.find((f) => f.endsWith(".mmdb"));
            if (mmdbFile) {
                mmdbPath = path.join(fullPath, mmdbFile);
                break;
            }
        }
    }

    if (!mmdbPath) {
        throw new Error("MMDB file not found in archive");
    }

    console.log("Extraction completed!");
    return mmdbPath;
}

function cleanup(tempDir) {
    console.log("Cleaning up temporary files...");
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function main() {
    try {
        if (!LICENSE_KEY) {
            console.error("ERROR: MAXMIND_LICENSE_KEY environment variable is not set!");
            console.error("Please set it before running this script:");
            console.error("  export MAXMIND_LICENSE_KEY=your_license_key_here");
            console.error(
                "\nGet your license key from: https://www.maxmind.com/en/accounts/current/license-key"
            );
            process.exit(1);
        }

        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }

        if (!fs.existsSync(TARGET_DIR)) {
            fs.mkdirSync(TARGET_DIR, { recursive: true });
        }

        console.log("Downloading GeoLite2-City database...");
        await downloadFile(DOWNLOAD_URL, TEMP_FILE);

        const mmdbPath = await extractMmdbFile(TEMP_FILE, TEMP_DIR);

        if (fs.existsSync(TARGET_FILE)) {
            const backupFile = TARGET_FILE + ".backup";
            console.log("Backing up old database...");
            fs.copyFileSync(TARGET_FILE, backupFile);
        }

        console.log("Installing new database...");
        fs.copyFileSync(mmdbPath, TARGET_FILE);

        if (!fs.existsSync(BUILD_TARGET_DIR)) {
            fs.mkdirSync(BUILD_TARGET_DIR, { recursive: true });
        }

        console.log("Copying to build directory...");
        fs.copyFileSync(TARGET_FILE, BUILD_TARGET_FILE);

        const stats = fs.statSync(TARGET_FILE);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`\nSuccessfully updated GeoLite2-City database!`);
        console.log(`  Location: ${TARGET_FILE}`);
        console.log(`  Size: ${fileSizeMB} MB`);
        console.log(`  Last modified: ${stats.mtime.toLocaleString()}`);

        cleanup(TEMP_DIR);

        console.log("\nUpdate completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("\nError:", error.message);
        cleanup(TEMP_DIR);
        process.exit(1);
    }
}

main();
