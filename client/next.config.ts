import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    turbopack: {
        root: "./",
    },
    devIndicators: false,
};

export default nextConfig;
