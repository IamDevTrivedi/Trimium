import { readFileContent } from "@/lib/readFileContent";
import matter from "gray-matter";
import { Metadata } from "next";
import { LegalContent } from "../legal-content";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Review Trimium's Terms of Service. Understand the rules, regulations, and guidelines for using our platform.",
};

export default function Page() {
    const markdown = readFileContent("resources", "terms.mdx");
    const matterResult = matter(markdown);

    return (
        <LegalContent
            title={matterResult.data.title}
            lastUpdate={matterResult.data.lastUpdate}
            content={matterResult.content}
        />
    );
}
