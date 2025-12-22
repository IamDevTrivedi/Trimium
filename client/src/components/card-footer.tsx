import Link from "next/link";

export function IAgree() {
    return (
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
            I have read and agree to the{" "}
            <Link
                target="_blank"
                href="/terms-of-service"
                className="hover:text-foreground hover:underline hover:underline-offset-4 transition-all duration-300"
            >
                Terms of Service
            </Link>{" "}
            and{" "}
            <Link
                target="_blank"
                href="/privacy-policy"
                className="hover:text-foreground hover:underline hover:underline-offset-4 transition-all duration-300"
            >
                Privacy Policy
            </Link>
            .
        </p>
    );
}
