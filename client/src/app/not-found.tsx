import NotFoundClient from "./not-found-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found",
    description:
        "The page you are looking for does not exist or may have been moved. Return to Trimium homepage.",
};

export default function NotFoundPage() {
    return <NotFoundClient />;
}
