"use client";

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
import { motion, useInView } from "motion/react";
import { useRef } from "react";

function FadeSection({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function HomePage() {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,hsl(var(--primary)/0.06),transparent)]" />
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full px-4 pb-16 pt-24 md:pb-24 md:pt-32 lg:pb-32 lg:pt-40">
                    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm"
                        >
                            <Zap className="h-4 w-4 ml-2 text-primary" />
                            Professional URL Management
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
                        >
                            Shorten, Track, and Optimize Your Links with{" "}
                            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Trimium
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-10 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg md:text-xl"
                        >
                            Create powerful short URLs, generate custom QR codes, and gain deep
                            insights with advanced analytics. Perfect for businesses, marketers, and
                            teams.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
                        >
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
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-8 text-sm text-muted-foreground/80"
                        >
                            No credit card required • Free forever
                        </motion.p>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="w-full border-t border-border/50 px-4 py-16 md:py-20">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FadeSection delay={0.05}>
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
                                                    Transform long URLs into short, memorable links
                                                    in seconds
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
                            </FadeSection>

                            <FadeSection delay={0.1}>
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
                                                    Create stunning branded QR codes with custom
                                                    colors, sizes, and your logo
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
                            </FadeSection>
                        </div>

                        {/* LinkHub Highlight */}
                        <FadeSection delay={0.15}>
                            <Card className="mt-4 overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
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
                                                social profiles. Choose from 5 modern themes and
                                                share one link everywhere.
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
                        </FadeSection>
                    </div>
                </section>

                {/* Features Overview */}
                <section className="w-full bg-muted/20 px-4 py-16 md:py-24">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12 text-center md:mb-16">
                                <h2 className="mb-4 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                                    Powerful Features for Every Need
                                </h2>
                                <p className="mx-auto max-w-2xl text-pretty text-muted-foreground sm:text-lg">
                                    Everything you need to manage, track, and optimize your links
                                </p>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: BarChart3,
                                    title: "Advanced Analytics",
                                    description:
                                        "Track clicks, locations, devices, and referrers with real-time analytics and exportable reports",
                                },
                                {
                                    icon: Users,
                                    title: "Team Collaboration",
                                    description:
                                        "Create workspaces, add team members, and manage permissions with role-based access control",
                                },
                                {
                                    icon: Lock,
                                    title: "Password Protection",
                                    description:
                                        "Secure your links with password protection and set auto-expire dates for time-sensitive content",
                                },
                                {
                                    icon: Globe,
                                    title: "LinkHub Pages",
                                    description:
                                        "Build your link-in-bio page with custom links, social icons, and 5 modern themes at /t/username",
                                },
                                {
                                    icon: Palette,
                                    title: "Custom QR Codes",
                                    description:
                                        "Design branded QR codes with custom colors and download in multiple formats (SVG, PNG, PDF)",
                                },
                                {
                                    icon: Zap,
                                    title: "Bulk Operations",
                                    description:
                                        "Generate multiple URLs at once with CSV upload, complete with error handling and validation",
                                },
                            ].map((feature, i) => (
                                <FadeSection key={feature.title} delay={i * 0.06}>
                                    <Card className="group border-border/50 bg-card/50 transition-all duration-300 hover:border-border hover:bg-card hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                                <feature.icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="mb-2 font-semibold text-foreground">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>

                        <FadeSection delay={0.3}>
                            <div className="mt-12 text-center">
                                <Link href="/features">
                                    <Button size="lg" variant="outline" className="gap-2">
                                        Explore All Features
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </FadeSection>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full px-4 py-16 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <FadeSection>
                            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 text-center shadow-lg shadow-primary/5 md:p-12">
                                <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
                                <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                                <div className="relative">
                                    <h2 className="mb-4 text-balance text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                                        Ready to Get Started?
                                    </h2>
                                    <p className="mb-8 text-pretty text-muted-foreground sm:text-lg">
                                        Join thousands of users who trust Trimium for their link
                                        management needs
                                    </p>
                                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
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
                            </div>
                        </FadeSection>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
