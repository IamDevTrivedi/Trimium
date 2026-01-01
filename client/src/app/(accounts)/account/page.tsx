import { AccountPage } from "@/components/account-page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Account",
    description:
        "Manage your Trimium account settings, profile information, and preferences. View and update your personal details.",
};

export default function page() {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 my-12 bg-background">
            <AccountPage />
        </div>
    );
}
