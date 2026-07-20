import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import config from "@/config/env";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const firaSans = Fira_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const siteUrl = config.PUBLIC_FRONTEND_URL;

export const metadata: Metadata = {
    title: {
        default: "Trimium - Professional URL Shortener & Link Management",
        template: "%s | Trimium",
    },
    description:
        "Shorten, track, and optimize your links with Trimium. Create powerful short URLs, generate custom QR codes, and gain deep insights with advanced analytics. Perfect for businesses, marketers, and teams.",
    keywords: [
        "URL shortener",
        "link management",
        "short links",
        "QR code generator",
        "link analytics",
        "branded links",
        "link tracking",
        "team collaboration",
        "workspace management",
    ],
    authors: [{ name: "Trimium" }],
    creator: "Trimium",
    publisher: "Trimium",
    metadataBase: new URL(siteUrl || "https://trimium.vercel.app"),
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        siteName: "Trimium",
        title: "Trimium - Professional URL Shortener & Link Management",
        description:
            "Shorten, track, and optimize your links with Trimium. Create powerful short URLs, generate custom QR codes, and gain deep insights with advanced analytics.",
        images: ["/og-home.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Trimium - Professional URL Shortener & Link Management",
        description:
            "Shorten, track, and optimize your links with Trimium. Create powerful short URLs, generate custom QR codes, and gain deep insights with advanced analytics.",
        images: ["/og-home.png"],
    },
    icons: {
        icon: "/favicon.png",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${firaSans.variable} ${firaCode.variable}`}
            suppressHydrationWarning
        >
            <body className="antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <ServiceWorkerRegister />
                    {children}
                    <Toaster />
                    {config.PUBLIC_isProduction && <Analytics />}
                </ThemeProvider>
            </body>
        </html>
    );
}
