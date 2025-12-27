import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ProtectPage from "@/components/protect-page";

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
