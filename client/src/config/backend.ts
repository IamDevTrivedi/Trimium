import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import config from "@/config/env";
import crypto from "crypto";

const solvePow = (powToken: string, difficulty: number): number => {
    const targetPrefix = '0'.repeat(difficulty);
    let nonce = 0;
    let hash = '';

    while (true) {
        const data = `${powToken}|${nonce}`;
        hash = crypto.createHash("sha256").update(data).digest("hex");

        if (hash.startsWith(targetPrefix)) {
            return nonce;
        }

        nonce++;

        if (nonce > 10000000) {
            throw new Error("PoW solving took too long");
        }
    }
};

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
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 429 && !originalRequest._retry) {
            const data = error.response.data as any;

            if (data?.code === "rate_limit_pow_challenge" && data?.PoW_token && data?.difficulty) {
                originalRequest._retry = true;

                try {
                    const nonce = solvePow(data.PoW_token, data.difficulty);
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers["x-pow"] = `${data.PoW_token}:${nonce}`;
                    return backend(originalRequest);
                } catch (powError) {
                    console.error("Failed to solve PoW challenge:", powError);
                    return Promise.reject(error);
                }
            }
        }

        return Promise.reject(error);
    }
);

backend.interceptors.request.use(
    (config) => {

        if (config && '_retry' in config) {
            delete (config as any)._retry;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
