// Standalone script to run client and server concurrently in development

import { $ } from "bun";

console.log("Starting Trimium development servers...");

// Run both client and server concurrently
const client = $`bun --cwd client dev`;
const server = $`bun --cwd server dev`;

// Wait for both processes (they run indefinitely in dev mode)
try {
    await Promise.all([client, server]);
} catch (error) {
    console.error("Development servers exited:", error);
    process.exit(1);
}
