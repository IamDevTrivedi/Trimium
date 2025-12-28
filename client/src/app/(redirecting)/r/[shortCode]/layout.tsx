import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trying to redirect...",
    description: "You are being redirected",
};

export default function layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
