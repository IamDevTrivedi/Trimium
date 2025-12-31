"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function TopBackButton() {
    const router = useRouter();
    return (
        <Button
            variant="link"
            className="mb-6 text-muted-foreground hover:text-primary hover:no-underline hover:cursor-pointer"
            onClick={() => router.back()}
        >
            &larr; Back
        </Button>
    );
}
