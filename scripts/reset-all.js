// Standalone script to reset the project by cleaning and reinstalling dependencies

import { $ } from "bun";

try {
    await $`bun run scripts/clean-all.js`;
    await $`bun run scripts/install-all.js`;
} catch (error) {
    console.error("Reset failed");
    console.error(error);
    process.exit(1);
}
