import path from "path";
import { $ } from "bun";

const dirs = [".", "./server", "./client"];
const failedDirs = [];

for (const dir of dirs) {
    const absPath = path.resolve(dir);
    try {
        await $`bun install`.cwd(absPath).quiet();
    } catch {
        failedDirs.push(dir);
    }
}

if (failedDirs.length > 0) {
    console.error(`Fail: could not install dependencies in: ${failedDirs.join(", ")}`);
    process.exit(1);
} else {
    console.log("Success: dependencies installed in all directories.");
}