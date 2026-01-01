import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QR Code Generator",
    description:
        "Create custom QR codes for free with Trimium. Generate branded QR codes with custom colors, sizes, and logos. Perfect for marketing, business cards, and more.",
    openGraph: {
        title: "QR Code Generator | Trimium",
        description:
            "Create stunning, branded QR codes for your business. Customize colors, add logos, and download in multiple formats.",
    },
};

export default function QRGeneratorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
