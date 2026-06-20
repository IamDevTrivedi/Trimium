import HomePageClient from "./home-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trimium - Professional URL Shortener & Link Management",
    description:
        "Shorten URLs, generate QR codes with your brand colors, and see who clicks — by device, location, browser, and more. No fluff, no hidden pricing. Just tools that work.",
    openGraph: {
        title: "Trimium - Professional URL Shortener & Link Management",
        description:
            "Create powerful short URLs, generate custom QR codes, and gain deep insights with advanced analytics. Perfect for businesses, marketers, and teams.",
        images: ["/og-home.png"],
    },
};

export default function HomePage() {
    return <HomePageClient />;
}
