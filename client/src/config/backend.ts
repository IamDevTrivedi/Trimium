import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import config from "@/config/env";
import crypto from "crypto";

interface RateLimitPoWChallenge {
    code: "rate_limit_pow_challenge";
    message: string;
    token: string;
}

const MAX_POW_ITERATIONS = 10_000_000;

function isRateLimitPoWChallenge(data: unknown): data is RateLimitPoWChallenge {
    return (
        typeof data === "object" &&
        data !== null &&
        (data as { code?: unknown }).code === "rate_limit_pow_challenge" &&
        typeof (data as { token?: unknown }).token === "string"
    );
}

function solvePoW(token: string): string {
    const parts = token.split(".");
    if (parts.length !== 4) {
        throw new Error("Invalid PoW token");
    }

    const difficultyStr = parts[1];
    const salt = parts[2];
    if (!difficultyStr || !salt) {
        throw new Error("Invalid PoW token");
    }

    const difficulty = parseInt(difficultyStr, 10);
    if (!Number.isFinite(difficulty)) {
        throw new Error("Invalid PoW difficulty");
    }

    for (let nonce = 0; nonce < MAX_POW_ITERATIONS; nonce++) {
        const nonceStr = String(nonce);
        const hash = crypto.createHash("sha256").update(`${salt}|${nonceStr}`).digest("hex");

        const leadingZeros = hash.match(/^0+/);
        const leadingZeroCount = leadingZeros ? leadingZeros[0].length : 0;

        if (leadingZeroCount >= difficulty) {
            return nonceStr;
        }
    }

    throw new Error(`PoW solving exceeded ${MAX_POW_ITERATIONS} iterations`);
}

export const backend = axios.create({
    baseURL: config.PUBLIC_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

backend.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (!error.config) {
            return Promise.reject(error);
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (
            error.response?.status === 429 &&
            isRateLimitPoWChallenge(error.response.data) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            const token = error.response.data.token;

            try {
                const nonce = solvePoW(token);
                originalRequest.headers["x-pow-token"] = token;
                originalRequest.headers["x-pow-nonce"] = nonce;
                return backend(originalRequest);
            } catch (solveErr) {
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);
