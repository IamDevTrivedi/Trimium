import { CreateRedirectForm } from "@/components/create-redirect-form";

export default function Page() {
    return (
        <main className="min-h-screen bg-background py-8 px-4 my-12">
            <div className="container max-w-4xl mx-auto">
                <CreateRedirectForm />
            </div>
        </main>
    );
}
