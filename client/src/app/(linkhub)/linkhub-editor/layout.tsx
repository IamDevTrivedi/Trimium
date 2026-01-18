import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="w-full block">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
}
