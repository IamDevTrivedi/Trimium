import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
    Link2,
    QrCode,
    BarChart3,
    Users,
    Lock,
    Zap,
    Globe,
    Palette,
    ArrowRight,
    Mail,
    Sparkles,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trimium - Professional URL Shortener & Link Management",
    description:
        "Create powerful short URLs, generate custom QR codes, and gain deep insights with advanced analytics. Trimium is perfect for businesses, marketers, and teams looking to optimize their link management.",
    openGraph: {
        title: "Trimium - Professional URL Shortener & Link Management",
        description:
            "Create powerful short URLs, generate custom QR codes, and gain deep insights with advanced analytics. Perfect for businesses, marketers, and teams.",
        images: ["/og-home.png"],
    },
};

export default function HomePage() {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full px-4 pb-16 pt-24 md:pb-24 md:pt-32 lg:pb-32 lg:pt-40">
                    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                            <Zap className="h-4 w-4 ml-2 text-primary" />
                            Professional URL Management
                        </div>
                        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                            Shorten, Track, and Optimize Your Links with{" "}
                            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Trimium
                            </span>
                        </h1>
                        <p className="mb-10 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg md:text-xl">
                            Create powerful short URLs, generate custom QR codes, and gain deep
                            insights with advanced analytics. Perfect for businesses, marketers, and
                            teams.
                        </p>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                            <Link href="/create-account" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full gap-2 sm:w-auto">
                                    Create Free Account
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/features" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full gap-2 sm:w-auto"
                                >
                                    Explore Features
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-8 text-sm text-muted-foreground/80">
                            No credit card required • Free forever
                        </p>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="w-full border-t border-border/50 px-4 py-16 md:py-20">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                                            <Link2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h3 className="font-semibold text-foreground">
                                                Create Short URL
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Transform long URLs into short, memorable links in
                                                seconds
                                            </p>
                                            <Link href="/w" className="inline-block">
                                                <Button
                                                    variant="link"
                                                    className="h-auto gap-2 p-0 text-primary"
                                                >
                                                    Go to Workspace
                                                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                                            <QrCode className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h3 className="font-semibold text-foreground">
                                                Custom QR Generator
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Create stunning branded QR codes with custom colors,
                                                sizes, and your logo
                                            </p>
                                            <Link href="/qr-generator" className="inline-block">
                                                <Button
                                                    variant="link"
                                                    className="h-auto gap-2 p-0 text-primary"
                                                >
                                                    Create QR Code
                                                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* LinkHub Highlight */}
                        <Card className="mt-4 overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-semibold text-foreground">
                                            LinkHub - Your Link-in-Bio Page
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create a personalized page with all your links and
                                            social profiles. Choose from 5 modern themes and share
                                            one link everywhere.
                                        </p>
                                    </div>
                                    <Link href="/linkhub-editor" className="w-full sm:w-auto">
                                        <Button className="w-full gap-2 sm:w-auto">
                                            Create Your LinkHub
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Features Overview */}
                <section className="w-full px-4 py-16 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-12 text-center md:mb-16">
                            <h2 className="mb-4 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                                Powerful Features for Every Need
                            </h2>
                            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground sm:text-lg">
                                Everything you need to manage, track, and optimize your links
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">
                                        Advanced Analytics
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Track clicks, locations, devices, and referrers with
                                        real-time analytics and exportable reports
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">
                                        Team Collaboration
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Create workspaces, add team members, and manage permissions
                                        with role-based access control
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                        <Lock className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">
                                        Password Protection
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Secure your links with password protection and set
                                        auto-expire dates for time-sensitive content
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                        <Globe className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">
                                        LinkHub Pages
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Build your link-in-bio page with custom links, social icons,
                                        and 5 modern themes at /t/username
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                        <Palette className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">
                                        Custom QR Codes
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Design branded QR codes with custom colors and download in
                                        multiple formats (SVG, PNG, PDF)
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-2 font-semibold text-foreground">
                                        Bulk Operations
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Generate multiple URLs at once with CSV upload, complete
                                        with error handling and validation
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-12 text-center">
                            <Link href="/features">
                                <Button size="lg" variant="outline" className="gap-2">
                                    Explore All Features
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full border-t border-border/50 px-4 py-16 md:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-4 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                            Ready to Get Started?
                        </h2>
                        <p className="mb-8 text-pretty text-muted-foreground sm:text-lg">
                            Join thousands of users who trust Trimium for their link management
                            needs
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                            <Link href="/create-account" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Create Free Account
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/contact-us" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full gap-2 sm:w-auto"
                                >
                                    Contact Sales
                                    <Mail className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
