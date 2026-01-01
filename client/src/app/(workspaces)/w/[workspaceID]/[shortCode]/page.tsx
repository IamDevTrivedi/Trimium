import { ShortCodePerformance } from "@/components/shortcode-performance";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Link Analytics",
    description:
        "View detailed analytics for your short URL. Track clicks, geographic data, devices, referrers, and performance metrics.",
};

export default function page() {
    return (
        <div className="w-full max-w-5xl mx-auto min-h-screen px-4 py-8 my-12">
            <ShortCodePerformance />
        </div>
    );
}
