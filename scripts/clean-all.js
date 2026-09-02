import { $ } from "bun";

const itemsToDelete = [
    "./node_modules",
    "./server/node_modules",
    "./client/node_modules",
    "./server/dist",
    "./client/build",
    "./client/.next",
];

try {
    await Promise.all(itemsToDelete.map((item) => $`rm -rf ${item}`.quiet()));

    console.log("Success: build artifacts and dependencies cleaned.");
} catch {
    console.error("Fail: could not clean build artifacts and dependencies.");
    process.exit(1);
}
