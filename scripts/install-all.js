// Standalone script to install dependencies in all project directories

import { $ } from "bun";

const dirs = [".", "./server", "./client"];

for (const dir of dirs) {
    try {
        await $`bun install`.cwd(dir);
    } catch (error) {
        console.error(`Failed to install in ${dir}`);
        console.error(error);
        process.exit(1);
    }
}
