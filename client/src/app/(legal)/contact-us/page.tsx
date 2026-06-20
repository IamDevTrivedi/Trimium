import ContactPageClient from "./contact-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with the Trimium team. We're here to help with questions, feedback, partnerships, and support for our URL shortening and link management platform.",
    openGraph: {
        title: "Contact Us | Trimium",
        description:
            "Have questions about Trimium? Reach out to our team for support, feedback, or partnership inquiries.",
    },
};

export default function ContactPage() {
    return <ContactPageClient />;
}
