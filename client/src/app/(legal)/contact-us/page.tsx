import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with the Trimium team. We're here to help with questions, feedback, partnerships, and support for our URL shortening and link management platform.",
    openGraph: {
        title: "Contact Us | Trimium",
        description:
            "Have questions about Trimium? Reach out to our team for support, feedback, or partnership inquiries.",
    },
};

export default function ContactPage() {
    return (
        <div className="flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-6 sm:py-8">
            {/* Header Section */}
            <section className="text-center mb-8 sm:mb-12">
                <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
                    Get in Touch
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Have questions about Trimium? We&apos;re here to help. Send us a message and
                    we&apos;ll respond as soon as possible.
                </p>
            </section>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1 gap-4">
                    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm sm:text-base">Email Us</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        For general inquiries
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <a
                                href="mailto:devtrivedi.work@gmail.com"
                                className="text-sm text-primary hover:underline"
                            >
                                devtrivedi.work@gmail.com
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm sm:text-base">
                                        Response Time
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        We aim to respond quickly
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">
                                Within 24-48 business hours
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm sm:text-base">Location</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Operating worldwide
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">
                                Remote-first, global team
                            </p>
                        </CardContent>
                    </Card>

                    {/* FAQ Note */}
                    <div className="rounded-lg border bg-muted/50 p-3 sm:p-4 flex flex-col justify-center">
                        <h3 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2">
                            Quick Help
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Before reaching out, you might find answers in our{" "}
                            <Link
                                href="/features"
                                className="text-primary hover:underline font-medium"
                            >
                                Features page
                            </Link>{" "}
                            or{" "}
                            <Link
                                href="/about"
                                className="text-primary hover:underline font-medium"
                            >
                                About section
                            </Link>
                            .
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="sm:col-span-2 lg:col-span-2">
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl">Send us a Message</CardTitle>
                            <CardDescription className="text-sm">
                                Fill out the form below and we&apos;ll get back to you shortly.
                            </CardDescription>
                        </CardHeader>
                        <Separator />
                        <CardContent className="p-4 sm:p-6">
                            <ContactForm />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Additional Info */}
            <section className="mt-12 sm:mt-16 text-center">
                <Separator className="mb-6 sm:mb-8" />
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                    Other Ways to Connect
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">
                    Follow us on social media for updates, tips, and announcements.
                </p>
                <div className="flex justify-center gap-4 sm:gap-6">
                    <a
                        href="https://www.linkedin.com/in/contact-devtrivedi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Linkedin className="h-4 w-4" />
                        <span className="hidden sm:inline">LinkedIn</span>
                    </a>
                    <span className="text-muted-foreground/40">|</span>
                    <a
                        href="https://github.com/IamDevTrivedi/Trimium"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Github className="h-4 w-4" />
                        <span className="hidden sm:inline">GitHub</span>
                    </a>
                </div>
            </section>
        </div>
    );
}
