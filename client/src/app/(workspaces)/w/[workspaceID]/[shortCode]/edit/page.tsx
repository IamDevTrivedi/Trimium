import { EditRedirectForm } from "@/components/edit-redirect-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Short URL",
    description:
        "Edit your Trimium short URL settings. Update the destination, expiration, password protection, and other configurations.",
};

export default function Page() {
    return (
        <main className="min-h-screen bg-background py-8 px-4 my-12">
            <div className="container max-w-4xl mx-auto">
                <EditRedirectForm />
            </div>
        </main>
    );
}
