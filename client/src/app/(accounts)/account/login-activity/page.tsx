import { LoginHistory } from "@/components/login-history";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login Activity",
    description:
        "Review your Trimium account login history. Monitor recent sign-ins, devices, and locations for security.",
};

export default function page() {
    return <LoginHistory />;
}
