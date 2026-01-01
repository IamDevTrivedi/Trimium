import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    Lock,
    MapPin,
    Monitor,
    Palette,
    QrCode,
    Shield,
    Tag,
    Target,
    Users,
    Zap,
    FileSpreadsheet,
    Grid3x3,
    Timer,
    TrendingUp,
    Link2,
    Eye,
    MousePointerClick,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Features",
    description:
        "Explore Trimium's comprehensive features for URL shortening, custom QR codes, advanced analytics, team collaboration, and more. Everything you need to manage and optimize your links.",
    openGraph: {
        title: "Features | Trimium",
        description:
            "Discover all the powerful features Trimium offers for professional link management, analytics, and team collaboration.",
    },
};

export default function FeaturesPage() {
    return (
        <div className="flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-8 my-12">
            {/* Hero Section */}
            <section className="w-full max-w-6xl mx-auto border-b border-border bg-muted/10 py-16 md:py-24">
                <div className="container px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
                            Comprehensive Features
                        </h1>
                        <p className="text-pretty text-lg text-muted-foreground leading-relaxed">
                            Everything you need to create, manage, and optimize your short links
                            with advanced analytics and team collaboration tools
                        </p>
                    </div>
                </div>
            </section>

            {/* Analytics Features */}
            <section className="w-full max-w-6xl mx-auto container px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12">
                        <h2 className="mb-4 text-3xl font-bold">Advanced Analytics & Tracking</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Gain deep insights into your link performance with comprehensive
                            analytics
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <Monitor className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Device Distribution</CardTitle>
                                <CardDescription>
                                    Track clicks by device type including desktop, mobile, and
                                    tablet users
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Globe className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Browser Analytics</CardTitle>
                                <CardDescription>
                                    Monitor which browsers your audience uses to access your links
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <MapPin className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Location Tracking</CardTitle>
                                <CardDescription>
                                    View geographic distribution by country and state for targeted
                                    insights
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <TrendingUp className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Performance Visualization</CardTitle>
                                <CardDescription>
                                    All-time performance charts showing trends and patterns over
                                    time
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Eye className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Unique vs Returning</CardTitle>
                                <CardDescription>
                                    Distinguish between unique visitors and returning users
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <FileDown className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Export Analytics</CardTitle>
                                <CardDescription>
                                    Download your analytics data in CSV or PDF format for reporting
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Team & Organization */}
            <section className="w-full max-w-6xl mx-auto border-y border-border bg-muted/10 py-16">
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12">
                            <h2 className="mb-4 text-3xl font-bold">Team Collaboration</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Work together seamlessly with workspace and permission management
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <Tag className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Link Tagging</CardTitle>
                                    <CardDescription>
                                        Organize your links with custom tags for easy categorization
                                        and filtering
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Users className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Workspaces</CardTitle>
                                    <CardDescription>
                                        Create separate workspaces for different projects or teams
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Shield className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Role-Based Permissions</CardTitle>
                                    <CardDescription>
                                        Assign admin, editor, or viewer roles to control access
                                        levels
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security & Control */}
            <section className="w-full max-w-6xl mx-auto container px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12">
                        <h2 className="mb-4 text-3xl font-bold">Security & Link Control</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Protect and manage your links with advanced security features
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <Lock className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Password Protection</CardTitle>
                                <CardDescription>
                                    Secure sensitive links with password authentication before
                                    access
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Timer className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Scheduled Links</CardTitle>
                                <CardDescription>
                                    Set start and end dates for links to auto-appear and auto-expire
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <BarChart3 className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Traffic Limits</CardTitle>
                                <CardDescription>
                                    Set maximum traffic transfer limits per URL for bandwidth
                                    control
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* QR Code Features */}
            <section className="w-full max-w-6xl mx-auto border-y border-border bg-linear-to-br from-primary/5 via-background to-primary/5 py-16">
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-3xl font-bold">Custom QR Code Generator</h2>
                                </div>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Create stunning, branded QR codes with advanced customization
                                </p>
                            </div>
                            <a
                                href="/qr-generator"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Try QR Generator
                                <QrCode className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                                <CardHeader>
                                    <Palette className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Custom Colors</CardTitle>
                                    <CardDescription>
                                        Choose from 12+ color presets or create your own custom
                                        color combinations
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                                <CardHeader>
                                    <QrCode className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Brand Logo</CardTitle>
                                    <CardDescription>
                                        Upload your brand logo to display in the center of your QR
                                        code
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                                <CardHeader>
                                    <Zap className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Multiple Sizes</CardTitle>
                                    <CardDescription>
                                        Generate QR codes from 64px to 2048px - perfect for any use
                                        case
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                                <CardHeader>
                                    <Download className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Export Options</CardTitle>
                                    <CardDescription>
                                        Download in PNG, SVG, JPEG, or WebP formats for any platform
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bulk Operations */}
            <section className="w-full max-w-6xl mx-auto container px-4 py-16">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12">
                        <h2 className="mb-4 text-3xl font-bold">Bulk Operations & Automation</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Save time with powerful bulk tools and automation features
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <FileSpreadsheet className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Bulk URL Generation</CardTitle>
                                <CardDescription>
                                    Upload a CSV template to create multiple short URLs at once with
                                    automatic validation
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Zap className="mb-2 h-8 w-8 text-primary" />
                                <CardTitle>Error Handling</CardTitle>
                                <CardDescription>
                                    Smart error detection with line numbers to help you fix issues
                                    in bulk uploads quickly
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Link-in-Bio */}
            <section className="w-full max-w-6xl mx-auto border-y border-border bg-muted/10 py-16">
                <div className="container px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12">
                            <h2 className="mb-4 text-3xl font-bold">Link-in-Bio Builder</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Create stunning landing pages for your social media profiles
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <Grid3x3 className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Drag-and-Drop Editor</CardTitle>
                                    <CardDescription>
                                        Easily build pages with links, text, images, videos, and
                                        embeds using intuitive interface
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Palette className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Pre-made Themes</CardTitle>
                                    <CardDescription>
                                        Choose from 5-10 beautiful themes with live preview and
                                        custom color options
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Clock className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Scheduled Blocks</CardTitle>
                                    <CardDescription>
                                        Set blocks to appear or disappear based on date and time
                                        schedules
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <MousePointerClick className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Per-Block Analytics</CardTitle>
                                    <CardDescription>
                                        Track clicks and engagement for each individual button or
                                        link block
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Palette className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Custom Styling</CardTitle>
                                    <CardDescription>
                                        Customize fonts, colors, and layouts to match your brand
                                        perfectly
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <Eye className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle>Live Preview</CardTitle>
                                    <CardDescription>
                                        See changes in real-time as you build your link-in-bio page
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="w-full max-w-6xl mx-auto container px-4 py-16 md:py-24">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold">Frequently Asked Questions</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Get answers to common questions about ShortlyPro
                        </p>
                    </div>

                    <Accordion className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-left">
                                What is ShortlyPro and how does it work?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                ShortlyPro is a comprehensive URL shortening and management
                                platform. It transforms long URLs into short, memorable links while
                                providing advanced analytics, QR code generation, and team
                                collaboration features. Simply paste your long URL, customize your
                                short link, and start tracking its performance immediately.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-left">
                                Is ShortlyPro free to use?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Yes! ShortlyPro offers a free forever plan with essential features
                                including URL shortening, basic analytics, and QR code generation.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger className="text-left">
                                Can I customize my short links and QR codes?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                You can create custom branded short links with your own aliases. QR
                                codes can be customized with your brand colors and downloaded in
                                multiple formats (SVG, PNG, PDF).
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4">
                            <AccordionTrigger className="text-left">
                                What kind of analytics does ShortlyPro provide?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                ShortlyPro provides comprehensive analytics including click
                                tracking, geographic distribution (country), device and browser
                                breakdowns, click patterns by hour/day, unique vs returning
                                visitors, and exportable reports in CSV format.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5">
                            <AccordionTrigger className="text-left">
                                How does team collaboration work in ShortlyPro?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                ShortlyPro allows you to create workspaces where you can invite team
                                members with different permission levels (admin, editor, or viewer).
                                You can organize links with tags, share access to specific projects,
                                and collaborate on link management while maintaining control over
                                who can create, edit, or view links.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-6">
                            <AccordionTrigger className="text-left">
                                Can I protect my links with passwords or set expiration dates?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Yes! ShortlyPro offers multiple security features including password
                                protection for sensitive links, the ability to set start and end
                                dates for time-sensitive content, and traffic limits to control
                                bandwidth usage. These features help you maintain control over who
                                can access your links and when.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-7">
                            <AccordionTrigger className="text-left">
                                What is the link-in-bio builder feature?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                The link-in-bio builder lets you create beautiful landing pages
                                perfect for social media profiles. Use our drag-and-drop editor to
                                add links, text, images, videos, and embeds.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-8">
                            <AccordionTrigger className="text-left">
                                Can I create multiple short URLs at once?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Yes! ShortlyPro supports bulk URL generation through CSV template
                                upload. Simply download our template, fill in your URLs and custom
                                parameters, upload the file, and create tens of short links at once.
                                Our system includes error handling with line numbers to help you
                                quickly fix any issues in your bulk uploads.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-9">
                            <AccordionTrigger className="text-left">
                                Are my links and data secure with ShortlyPro?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Security is our top priority. All data is encrypted in transit and
                                at rest. We use industry-standard security practices, regular
                                security audits, and comply with data protection regulations. Your
                                links and analytics data are stored securely and are never shared
                                with third parties. We also offer features like password protection
                                and traffic limits for additional security.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-10">
                            <AccordionTrigger className="text-left">
                                How do I get started with ShortlyPro?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Getting started is easy! Simply sign up for a free account, no
                                credit card required. Once registered, you can immediately start
                                creating short URLs, generating QR codes, and tracking analytics.
                                Our intuitive interface makes it simple to get up and running in
                                minutes.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
        </div>
    );
}
