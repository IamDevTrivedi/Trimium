import WorkspacePageTabs from "@/components/workspace-page-tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Workspaces",
    description:
        "Manage your Trimium workspaces. Organize your short URLs, collaborate with teams, and track analytics across multiple projects.",
};

export default function WorkspacesPage() {
    return (
        <div className="flex min-h-screen flex-col max-w-5xl mx-auto my-12 px-4 py-8 bg-background text-foreground">
            <main className="flex-1 overflow-auto p-6">
                <WorkspacePageTabs />
            </main>
        </div>
    );
}
