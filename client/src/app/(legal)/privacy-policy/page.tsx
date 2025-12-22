import React from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { readFileContent } from "@/lib/readFileContent";
import matter from "gray-matter";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Read our privacy policy to understand how we handle your data.",
};

export default function Page() {
    const markdown = readFileContent("resources", "privacy.mdx");
    const matterResult = matter(markdown);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
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
