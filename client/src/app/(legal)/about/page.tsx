import { readFileContent } from "@/lib/readFileContent";
import matter from "gray-matter";
import { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
    title: "About",
    description:
        "Trimium is a URL shortener, QR code generator, and link management platform with analytics, team workspaces, and bulk link management built for teams and individuals.",
    openGraph: {
        title: "About | Trimium",
        description:
            "Learn about Trimium — a URL shortener with click analytics, QR code generation, team collaboration, and link management tools.",
        images: ["/og-about.png"],
    },
};

export default function Page() {
    const markdown = readFileContent("resources", "about.mdx");
    const matterResult = matter(markdown);

    return (
        <AboutContent
            title={matterResult.data.title}
            lastUpdate={matterResult.data.lastUpdate}
            content={matterResult.content}
        />
    );
}
