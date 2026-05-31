import { MarkdownContent } from "@/components/markdown-content";
import { readFileContent } from "@/lib/readFileContent";
import matter from "gray-matter";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description:
        "Trimium is a full-stack URL shortening and link management portfolio project built with Next.js, Express, MongoDB, and Redis.",
    openGraph: {
        title: "About | Trimium",
        description:
            "Full-stack portfolio project demonstrating URL shortening, analytics, team workspaces, QR codes, and more.",
    },
};

export default function Page() {
    const markdown = readFileContent("resources", "about.mdx");
    const matterResult = matter(markdown);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
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
