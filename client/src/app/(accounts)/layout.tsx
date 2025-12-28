import { ProtectPage } from "@/components/protect-page";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="w-full block">
            <ProtectPage>{children}</ProtectPage>
        </div>
    );
}
