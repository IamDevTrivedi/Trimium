"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    BarChart3,
    Clock,
    Download,
    FileDown,
    Globe,
    History,
    Lock,
    LogOut,
    Mail,
    MapPin,
    Monitor,
    Palette,
    QrCode,
    Shield,
    Tag,
    Target,
    Users,
    UserPen,
    Zap,
    FileSpreadsheet,
    Timer,
    TrendingUp,
    Link2,
    Eye,
    Sparkles,
    ArrowRight,
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

export default function FeaturesPage() {
    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,hsl(var(--primary)/0.04),transparent)]" />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full px-4 py-16 md:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl"
                        >
                            What Trimium actually does
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed"
                        >
                            URL shortener, QR codes, analytics, team workspaces, and link-in-bio —
                            all in one place. No fluff, no upsells.
                        </motion.p>
                    </div>
                </section>

                {/* Analytics Features */}
                <section className="w-full border-y border-border/50 bg-muted/20 px-4 py-16">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12">
                                <h2 className="mb-3 text-3xl font-bold text-foreground">
                                    Analytics that tell you what&apos;s working
                                </h2>
                                <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                    See who clicks, from where, on what device, and when — all in
                                    one dashboard.
                                </p>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: Monitor,
                                    title: "Device Distribution",
                                    description:
                                        "Breakdown by desktop, mobile, and tablet — so you know how your audience shows up",
                                },
                                {
                                    icon: Globe,
                                    title: "Browser Analytics",
                                    description:
                                        "Which browsers your visitors use — Chrome, Safari, Firefox, and more",
                                },
                                {
                                    icon: MapPin,
                                    title: "Location Tracking",
                                    description:
                                        "See clicks by country and state. Know where your audience actually is",
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Performance Charts",
                                    description:
                                        "Charts that show how your links perform over any period — daily, weekly, or monthly",
                                },
                                {
                                    icon: Eye,
                                    title: "Unique vs Returning",
                                    description:
                                        "See how many visitors are new vs. coming back for more",
                                },
                                {
                                    icon: FileDown,
                                    title: "CSV & PDF Exports",
                                    description:
                                        "Export your data in CSV or PDF — no formatting needed, just the numbers",
                                },
                            ].map((card, i) => (
                                <FadeSection key={card.title} delay={i * 0.06}>
                                    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <card.icon className="mb-1 h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>{card.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team & Organization */}
                <section className="w-full px-4 py-16">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12">
                                <h2 className="mb-3 text-3xl font-bold text-foreground">
                                    Team tools that don&apos;t get in the way
                                </h2>
                                <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                    Invite your team, set permissions, and keep everyone on the same
                                    page.
                                </p>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: Tag,
                                    title: "Link Tagging",
                                    description:
                                        "Tag your links to sort and filter them your way — by campaign, client, or project",
                                },
                                {
                                    icon: Users,
                                    title: "Workspaces",
                                    description:
                                        "Separate workspaces for different teams or projects. Keep things organized from day one",
                                },
                                {
                                    icon: Shield,
                                    title: "Role-Based Access",
                                    description:
                                        "Admin, editor, or viewer — each role gets the access they need, nothing more",
                                },
                                {
                                    icon: Mail,
                                    title: "Member Invitations",
                                    description:
                                        "Invite people by email with the right role. Manage pending invites in one place",
                                },
                                {
                                    icon: Tag,
                                    title: "Custom Colored Tags",
                                    description:
                                        "Color-code your links within each workspace — find what you need in seconds",
                                },
                                {
                                    icon: BarChart3,
                                    title: "Workspace Dashboard",
                                    description:
                                        "Total URLs, clicks, active links, and top performers — at a glance",
                                },
                            ].map((card, i) => (
                                <FadeSection key={card.title} delay={i * 0.06}>
                                    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <card.icon className="mb-1 h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>{card.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Security & Control */}
                <section className="w-full border-y border-border/50 bg-muted/20 px-4 py-16">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12">
                                <h2 className="mb-3 text-3xl font-bold text-foreground">
                                    You choose who sees what
                                </h2>
                                <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                    Passwords, expiry dates, traffic caps — you decide how each link
                                    behaves.
                                </p>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: Lock,
                                    title: "Password Protection",
                                    description:
                                        "Lock any link with a password. Only people with the key get through",
                                },
                                {
                                    icon: Timer,
                                    title: "Scheduled Links",
                                    description:
                                        "Set a start and end date. Links appear and expire automatically",
                                },
                                {
                                    icon: BarChart3,
                                    title: "Traffic Limits",
                                    description:
                                        "Cap how much traffic a link can handle. Stay in control of bandwidth",
                                },
                            ].map((card, i) => (
                                <FadeSection key={card.title} delay={i * 0.06}>
                                    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <card.icon className="mb-1 h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>{card.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* QR Code Features */}
                <section className="w-full px-4 py-16">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="mb-3 text-3xl font-bold text-foreground">
                                        QR codes that look like they belong to you
                                    </h2>
                                    <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                        Your brand colors, your logo, your sizes — download and use
                                        anywhere.
                                    </p>
                                </div>
                                <Link
                                    href="/qr-generator"
                                    className="inline-flex h-fit shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Try QR Generator
                                    <QrCode className="h-4 w-4" />
                                </Link>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: Palette,
                                    title: "Custom Colors",
                                    description:
                                        "12+ presets or pick your own — match your brand exactly",
                                },
                                {
                                    icon: QrCode,
                                    title: "Brand Logo",
                                    description:
                                        "Drop your logo in the center. Your QR, your brand",
                                },
                                {
                                    icon: Zap,
                                    title: "Any Size",
                                    description:
                                        "From 64px to 2048px — works for business cards or billboards",
                                },
                                {
                                    icon: Download,
                                    title: "Export Options",
                                    description:
                                        "PNG, SVG, JPEG, WebP — whatever your workflow needs",
                                },
                            ].map((card, i) => (
                                <FadeSection key={card.title} delay={i * 0.06}>
                                    <Card className="group border-primary/20 bg-linear-to-br from-primary/5 to-transparent backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <card.icon className="mb-1 h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>{card.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bulk Operations */}
                <section className="w-full border-y border-border/50 bg-muted/20 px-4 py-16">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12">
                                <h2 className="mb-3 text-3xl font-bold text-foreground">
                                    Bulk tools that save real time
                                </h2>
                                <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                    Upload a CSV, create dozens of links at once. We&apos;ll flag
                                    any errors so you can fix them fast.
                                </p>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 md:grid-cols-2">
                            {[
                                {
                                    icon: FileSpreadsheet,
                                    title: "Bulk URL Generation",
                                    description:
                                        "Download a template, fill in your URLs, upload — and create dozens of short links in one go",
                                },
                                {
                                    icon: Zap,
                                    title: "Error Handling",
                                    description:
                                        "We check each row. If something&apos;s wrong, you get the line number — no hunting around",
                                },
                            ].map((card, i) => (
                                <FadeSection key={card.title} delay={i * 0.06}>
                                    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <card.icon className="mb-1 h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>{card.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Account Management */}
                <section className="w-full px-4 py-16">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12">
                                <h2 className="mb-3 text-3xl font-bold text-foreground">
                                    Your account, your way
                                </h2>
                                <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                    Full control over your profile, sessions, and security settings.
                                </p>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: History,
                                    title: "Login Activity",
                                    description:
                                        "Every active session with device, browser, location, and IP — all in one list",
                                },
                                {
                                    icon: LogOut,
                                    title: "Remote Logout",
                                    description:
                                        "Lost a device? Revoke access from any session with one click, or via email",
                                },
                                {
                                    icon: UserPen,
                                    title: "Profile Management",
                                    description:
                                        "Update your name, username, or details anytime — with availability checking",
                                },
                                {
                                    icon: Lock,
                                    title: "Password Changes",
                                    description:
                                        "Change your password securely with verification and strength validation",
                                },
                            ].map((card, i) => (
                                <FadeSection key={card.title} delay={i * 0.06}>
                                    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <card.icon className="mb-1 h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>{card.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* LinkHub - Link-in-Bio */}
                <section className="w-full border-y border-border/50 bg-linear-to-br from-primary/5 via-background to-primary/5 px-4 py-16">
                    <div className="mx-auto max-w-5xl">
                        <FadeSection>
                            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                        <h2 className="text-3xl font-bold text-foreground">
                                            LinkHub
                                        </h2>
                                    </div>
                                    <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                        Your personal page at /t/yourname — links, socials, and
                                        themes, all in one place.
                                    </p>
                                </div>
                                <Link
                                    href="/linkhub-editor"
                                    className="inline-flex h-fit shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Create Your LinkHub
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </FadeSection>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: Palette,
                                    title: "5 Themes",
                                    description:
                                        "Midnight, Sunset, Forest, Ocean, or Lavender — pick the look that fits you",
                                },
                                {
                                    icon: Link2,
                                    title: "Up to 20 Links",
                                    description:
                                        "Add links with titles, toggle visibility, and drag to reorder",
                                },
                                {
                                    icon: Users,
                                    title: "Social Profiles",
                                    description:
                                        "Instagram, LinkedIn, GitHub, X, YouTube, TikTok — one click to add",
                                },
                                {
                                    icon: Eye,
                                    title: "Live Preview",
                                    description:
                                        "See exactly how your page looks as you build it — no guessing",
                                },
                                {
                                    icon: Globe,
                                    title: "Your Own URL",
                                    description:
                                        "Your page lives at /t/yourname. Short, clean, easy to share",
                                },
                                {
                                    icon: Shield,
                                    title: "Publish Control",
                                    description:
                                        "Keep it private while you edit, publish when you&apos;re ready",
                                },
                            ].map((card, i) => (
                                <FadeSection key={card.title} delay={i * 0.06}>
                                    <Card className="group border-primary/20 bg-linear-to-br from-primary/5 to-transparent backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                                        <CardHeader>
                                            <card.icon className="mb-1 h-8 w-8 text-primary transition-colors group-hover:text-primary/80" />
                                            <CardTitle>{card.title}</CardTitle>
                                            <CardDescription>{card.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </FadeSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="w-full px-4 py-16 md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <FadeSection>
                            <div className="mb-12 text-center">
                                <h2 className="mb-3 text-3xl font-bold text-foreground">
                                    Frequently Asked Questions
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Straight answers to common questions
                                </p>
                            </div>
                        </FadeSection>

                        <FadeSection>
                            <Accordion className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-left">
                                        What is Trimium and how does it work?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        Trimium is a URL shortener with built-in analytics, QR code
                                        generation, team workspaces, and link-in-bio pages. Paste a
                                        long URL, get a short one. Then track who clicks it, from
                                        where, and on what device.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-2">
                                    <AccordionTrigger className="text-left">
                                        Is Trimium free to use?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        Yes. The free plan includes URL shortening, basic analytics,
                                        and QR code generation. No credit card needed to start.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3">
                                    <AccordionTrigger className="text-left">
                                        What kind of analytics does Trimium provide?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        Click counts, geographic location (country-level), device
                                        and browser breakdowns, unique vs returning visitors, and
                                        exportable reports in CSV and PDF.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-4">
                                    <AccordionTrigger className="text-left">
                                        How does team collaboration work?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        Create workspaces, invite members by email, assign roles
                                        (admin, editor, or viewer), and organize links with custom
                                        tags. Each workspace has its own dashboard.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-5">
                                    <AccordionTrigger className="text-left">
                                        Can I protect my links with passwords or set expiration
                                        dates?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        Yes. Each link can have a password, a start/end date, and a
                                        traffic limit. You control who gets through and when.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-6">
                                    <AccordionTrigger className="text-left">
                                        What is LinkHub?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        A link-in-bio page at /t/yourname. Add up to 20 links,
                                        connect your social profiles, pick a theme, and publish when
                                        you&apos;re ready. One link to share everywhere.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </FadeSection>
                    </div>
                </section>
            </main>
        </div>
    );
}
