import { CreateRedirectForm } from "@/components/create-redirect-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Short URL",
    description:
        "Create a new short URL in your Trimium workspace. Customize your link, set expiration, add password protection, and more.",
};

export default function Page() {
    return (
        <main className="min-h-screen bg-background py-8 px-4 my-12">
            <div className="container max-w-4xl mx-auto">
                <CreateRedirectForm />
            </div>
        </main>
    );
}
