import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    turbopack: {
        root: "./",
    },
    devIndicators: false,
    reactStrictMode: false,
};

export default nextConfig;
