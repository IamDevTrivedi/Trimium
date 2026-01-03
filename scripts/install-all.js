// Standalone script to install dependencies in all project directories

import path from "path";
import { execSync } from "child_process";

const dirs = [".", "./server", "./client"];

dirs.forEach((dir) => {
    const absPath = path.resolve(dir);
    try {
        execSync("pnpm install", {
            cwd: absPath,
            stdio: "inherit",
        });
    } catch (error) {
        console.error(`Failed to install in ${dir}`);
        console.error(error);
    }
});