import FeaturesPageClient from "./features-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore all Trimium features — URL shortening, QR code generation, click analytics, team workspaces, link-in-bio pages, bulk operations, and more.",
    openGraph: {
        title: "Features | Trimium",
        description:
            "URL shortener, QR codes, analytics, team workspaces, and link-in-bio — all in one place. No fluff, no upsells.",
        images: ["/og-features.png"],
    },
};

export default function FeaturesPage() {
    return <FeaturesPageClient />;
}
