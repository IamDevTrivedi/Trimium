import Link from "next/link";
import { CircleAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Page Not Found",
    description:
        "The page you are looking for does not exist or may have been moved. Return to Trimium homepage.",
};

export default function Page() {
    return (
        <main className="min-h-screen md:min-h-screen flex items-center justify-center px-6 py-24">
            <section className="flex flex-col items-center text-center gap-4 max-w-prose">
                <CircleAlert className="h-12 w-12" aria-hidden="true" />
                <h1 className="text-balance text-2xl md:text-3xl font-semibold tracking-tight">
                    Page not found
                </h1>
                <p className="text-pretty leading-relaxed">
                    The page you're looking for doesn't exist, was moved, is temporarily
                    unavailable, or you don't have permission to view it.
                </p>
                <div className="pt-2">
                    <Button>
                        <Link
                            href="/"
                            aria-label="Back to home"
                            className="flex items-center justify-between text-center"
                        >
                            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </section>
        </main>
    );
}
