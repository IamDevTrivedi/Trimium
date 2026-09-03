// Standalone script to run client and server dev servers in parallel

import { $ } from "bun";

await Promise.all([
    $`bun run dev`.cwd("./client").nothrow(),
    $`bun run dev`.cwd("./server").nothrow(),
]);
