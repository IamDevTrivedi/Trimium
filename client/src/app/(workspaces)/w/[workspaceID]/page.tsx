import { WorkspaceDetails } from "@/components/workspace-details";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Workspace",
    description:
        "View and manage your Trimium workspace. Access all your short URLs, analytics, and team settings in one place.",
};

export default function page() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 my-12">
            <WorkspaceDetails />
        </div>
    );
}
