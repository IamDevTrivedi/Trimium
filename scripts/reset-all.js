// Standalone script to reset the project by cleaning and reinstalling dependencies

import { execSync } from "child_process";

try {
    execSync("node ./scripts/clean-all.js", { stdio: "inherit" });
    execSync("node ./scripts/install-all.js", { stdio: "inherit" });
} catch (error) {
    console.error("Reset failed");
    console.error(error);
    process.exit(1);
}
