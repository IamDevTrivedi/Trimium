import { execSync } from "child_process";

try {
    console.log("Step 1: Cleaning...");
    execSync("node ./scripts/clean-all.js", { stdio: "inherit" });

    console.log("\nStep 2: Installing...");
    execSync("node ./scripts/install-all.js", { stdio: "inherit" });

    console.log("Reset completed successfully!");
} catch (error) {
    console.error("Reset failed");
    console.error(error);
    process.exit(1);
}
