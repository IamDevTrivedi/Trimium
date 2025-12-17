import fs from "fs";
import path from "path";

const itemsToDelete = [
    { path: "./pnpm-lock.yaml", type: "file" },
    { path: "./node_modules", type: "dir" },
    { path: "./server/pnpm-lock.yaml", type: "file" },
    { path: "./server/node_modules", type: "dir" },
    { path: "./client/pnpm-lock.yaml", type: "file" },
    { path: "./client/node_modules", type: "dir" },

    { path: "./server/build", type: "dir" },
    { path: "./client/build", type: "dir" },
    { path: "./client/.next", type: "dir" },
];

itemsToDelete.forEach((item) => {
    const absPath = path.resolve(item.path);

    try {
        if (fs.existsSync(absPath)) {
            if (item.type === "dir") {
                fs.rmSync(absPath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(absPath);
            }
        }
    } catch (error) {
        console.error(`Failed to delete ${item.path}:`);
        console.error(error);
    }
});

console.log("\n\nCleanup completed!");
