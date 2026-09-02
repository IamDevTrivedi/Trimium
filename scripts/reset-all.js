import { $ } from "bun";

try {
    await $`bun ./scripts/clean-all.js`.quiet();
    await $`bun ./scripts/install-all.js`.quiet();
    console.log("Success: project reset completed.");
} catch {
    console.error("Fail: project reset failed.");
    process.exit(1);
}