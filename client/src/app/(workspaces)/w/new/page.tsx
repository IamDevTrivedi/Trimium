import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Workspace",
    description:
        "Create a new Trimium workspace to organize your URLs, invite team members, and manage link campaigns together.",
};

export default function CreateWorkspacePage() {
    return (
        <div className="min-h-screen mx-auto max-w-5xl px-4 py-8 w-full bg-background my-12">
            <CreateWorkspaceForm />
        </div>
    );
}
