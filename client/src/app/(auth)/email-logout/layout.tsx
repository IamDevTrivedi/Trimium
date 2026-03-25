
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Email Logout",
    description: "Logout from your account using email link",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>
        {children}
    </>;
}
