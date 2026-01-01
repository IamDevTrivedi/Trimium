import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Redirecting...",
    description:
        "You are being redirected to your destination. Powered by Trimium - Professional URL Shortener.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
