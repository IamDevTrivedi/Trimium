import { readFileContent } from "@/lib/readFileContent";
import matter from "gray-matter";
import { Metadata } from "next";
import { LegalContent } from "../legal-content";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "Read Trimium's Privacy Policy to understand how we collect, use, and protect your personal data.",
};

export default function Page() {
    const markdown = readFileContent("resources", "privacy.mdx");
    const matterResult = matter(markdown);

    return (
        <LegalContent
            title={matterResult.data.title}
            lastUpdate={matterResult.data.lastUpdate}
            content={matterResult.content}
        />
    );
}
