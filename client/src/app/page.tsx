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
} from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-8 my-12 md:my-4">
            {/* Hero Section */}
            <section className="w-full min-h-screen items-center justify-center max-w-5xl mx-auto container px-4 py-16 md:py-24 lg:py-32">
                <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm">
                        <Zap className="h-4 w-4 text-accent-foreground" />
                        Professional URL Management
                    </div>
                    <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        Shorten, Track, and Optimize Your Links with{" "}
                        <span className="text-primary">ShortlyPro</span>
                    </h1>
                    <p className="mb-8 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed md:text-xl">
                        Create powerful short URLs, generate custom QR codes, and gain deep insights
                        with advanced analytics. Perfect for businesses, marketers, and teams.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link href="/create-account">
                            <Button size="lg">
                                <div className="flex items-center gap-2 mx-3">
                                    Create Free Account
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Button>
                        </Link>
                        <Link href="/features">
                            <Button size="lg" variant="outline">
                                <div className="flex items-center gap-2 mx-3">
                                    Explore Features
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Button>
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-muted-foreground">
                        No credit card required • Free forever
                    </p>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="w-full max-w-6xl mx-auto border-y border-border py-12">
                <div className="container px-4">
                    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                        <Card className="border-2 transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                        <Link2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            Create Short URL
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                                            Transform long URLs into short, memorable links in
                                            seconds
                                        </p>
                                        <Link href="/create-url">
                                            <Button variant="ghost" className="h-auto p-0">
                                                <div className="flex items-center gap-2 ">
                                                    Shorten URL
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                        <QrCode className="h-6 w-6 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-lg font-semibold">
                                            Generate QR Code
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                                            Create custom branded QR codes with multiple download
                                            formats
                                        </p>
                                        <Link href="/create-qr">
                                            <Button variant="ghost" className="h-auto p-0">
                                                <div className="flex items-center gap-2 mx-3">
                                                    Create QR Code
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Features Overview */}
            <section className="w-full max-w-6xl mx-auto container px-4 py-16 md:py-24">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
                            Powerful Features for Every Need
                        </h2>
                        <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
                            Everything you need to manage, track, and optimize your links
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">Advanced Analytics</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Track clicks, locations, devices, and referrers with real-time
                                    analytics and exportable reports
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">Team Collaboration</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Create workspaces, add team members, and manage permissions with
                                    role-based access control
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                    <Lock className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">Password Protection</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Secure your links with password protection and set auto-expire
                                    dates for time-sensitive content
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                    <Globe className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">Link-in-Bio Builder</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Create beautiful link-in-bio pages with drag-and-drop editor,
                                    custom themes, and per-block analytics
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                    <Palette className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">Custom QR Codes</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Design branded QR codes with custom colors and download in
                                    multiple formats (SVG, PNG, PDF)
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">Bulk Operations</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Generate multiple URLs at once with CSV upload, complete with
                                    error handling and validation
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/features">
                            <Button size="lg" variant="outline">
                                <div className="flex items-center gap-2 mx-3">
                                    Explore All Features
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full max-w-6xl mx-auto border-y border-border bg-background py-16 md:py-24">
                <div className="container px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
                            Ready to Get Started?
                        </h2>
                        <p className="mb-8 text-pretty text-lg leading-relaxed">
                            Join thousands of users who trust ShortlyPro for their link management
                            needs
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Link href="/create-account">
                                <Button
                                    size="lg"
                                    className="gap-2 flex items-center justify-center"
                                >
                                    <div className="flex items-center gap-2 mx-3">
                                        Create Free Account
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/contact-us">
                                <Button size="lg" variant="outline">
                                    <div className="flex items-center gap-2 mx-3">
                                        Contact Sales
                                        <Mail className="h-4 w-4" />
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
