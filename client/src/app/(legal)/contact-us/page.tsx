import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Clock, MessageSquare } from "lucide-react";
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
        <div className="flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-8 my-12">
            {/* Header Section */}
            <section className="text-center mb-12">
                <div className="flex justify-center mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                        <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Get in Touch</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Have questions about Trimium? We&apos;re here to help. Send us a message and
                    we&apos;ll respond as soon as possible.
                </p>
            </section>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Contact Info Cards */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Email Us</CardTitle>
                                    <CardDescription>For general inquiries</CardDescription>
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

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Response Time</CardTitle>
                                    <CardDescription>We aim to respond quickly</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">
                                Within 24-48 business hours
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Location</CardTitle>
                                    <CardDescription>Operating worldwide</CardDescription>
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
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <h3 className="font-medium mb-2">Quick Help</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Before reaching out, you might find answers in our{" "}
                            <Link href="/features" className="text-primary hover:underline">
                                Features page
                            </Link>{" "}
                            or{" "}
                            <Link href="/about" className="text-primary hover:underline">
                                About section
                            </Link>
                            .
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send us a Message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we&apos;ll get back to you shortly.
                            </CardDescription>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6">
                            <ContactForm />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Additional Info */}
            <section className="mt-16 text-center">
                <Separator className="mb-8" />
                <h2 className="text-xl font-semibold mb-3">Other Ways to Connect</h2>
                <p className="text-muted-foreground mb-6">
                    Follow us on social media for updates, tips, and announcements.
                </p>
                <div className="flex justify-center gap-4">
                    <a
                        href="https://twitter.com/trimiumapp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                    >
                        Twitter / X
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a
                        href="https://github.com/trimium"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                    >
                        GitHub
                    </a>
                </div>
            </section>
        </div>
    );
}
