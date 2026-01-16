import crypto from 'crypto';

/**
 * Proof of Work Solver
 * Finds a nonce such that hash(PoW_token|nonce) has at least 'difficulty' leading zeroes
 */

function solvePow(powToken, difficulty) {
    console.log(`Starting PoW with token: ${powToken}`);
    console.log(`Difficulty: ${difficulty} leading zeroes required\n`);

    const targetPrefix = '0'.repeat(difficulty);
    let nonce = 0;
    let hash = '';
    const startTime = Date.now();

    while (true) {
        const data = `${powToken}|${nonce}`;
        hash = crypto.createHash('sha256').update(data).digest('hex');

        if (hash.startsWith(targetPrefix)) {
            const endTime = Date.now();
            const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);

            console.log(`✓ Solution found!`);
            console.log(`Nonce: ${nonce}`);
            console.log(`Hash: ${hash}`);
            console.log(`Attempts: ${nonce + 1}`);
            console.log(`Time: ${timeElapsed}s`);
            return nonce;
        }

        nonce++;

        // Log progress every 100000 attempts
        if (nonce % 100000 === 0) {
            console.log(`Tried ${nonce} nonces...`);
        }
    }
}

// Example usage
const powToken = process.argv[2] || 'example_token_123';
const difficulty = 4;

solvePow(powToken, difficulty);
