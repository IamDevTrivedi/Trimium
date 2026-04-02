import { Options } from "argon2";

export const HASH_OPTIONS: Options = Object.freeze({
    type: 2,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
});
