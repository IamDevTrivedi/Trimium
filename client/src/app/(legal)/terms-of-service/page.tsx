import React from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { readFileContent } from "@/lib/readFileContent";
import matter from "gray-matter";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Read our Terms of Service to understand the rules and regulations for using our platform.",
};

export default function Page() {
    const markdown = readFileContent("resources", "terms.mdx");
    const matterResult = matter(markdown);

    return (
        <div className="container mx-auto px-4 py-8 my-12 max-w-5xl">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">{matterResult.data.title}</h1>
                <p className="text-sm text-muted-foreground mb-8">
                    Last Updated: {matterResult.data.lastUpdate}
                </p>
            </div>
            <MarkdownContent content={matterResult.content} />
        </div>
    );
}
