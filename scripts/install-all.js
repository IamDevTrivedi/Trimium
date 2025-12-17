import path from "path";
import { execSync } from "child_process";

const dirs = [".", "./server", "./client"];

dirs.forEach((dir) => {
    const absPath = path.resolve(dir);
    console.log(`\n\n\nInstalling in ${dir}...\n\n`);

    try {
        execSync("pnpm install", {
            cwd: absPath,
            stdio: "inherit",
        });
    } catch (error) {
        console.error(`Failed to install in ${dir}`);
        console.error(error);
        process.exit(1);
    }
});

console.log("All installations completed successfully!");
