import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    turbopack: {
        root: path.resolve(__dirname, ".."),
    },
    devIndicators: false,
    reactStrictMode: false,
};

export default nextConfig;
