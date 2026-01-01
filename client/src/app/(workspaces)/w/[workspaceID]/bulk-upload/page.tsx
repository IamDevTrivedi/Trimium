import { BulkUploadURLs } from "@/components/bulk-upload-urls";
import TopBackButton from "@/components/top-back-button";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bulk Upload URLs",
    description:
        "Import multiple URLs at once to your Trimium workspace. Upload a CSV or JSON file to create short links in bulk.",
};

export default function BulkUploadPage({ params }: { params: Promise<{ workspaceID: string }> }) {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 my-12">
            <BulkUploadWrapper params={params} />
        </div>
    );
}

async function BulkUploadWrapper({ params }: { params: Promise<{ workspaceID: string }> }) {
    const { workspaceID } = await params;

    return (
        <>
            <div className="flex items-center gap-4">
                <TopBackButton />
            </div>
            <BulkUploadURLs workspaceID={workspaceID} />
        </>
    );
}
