"use client";

import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Mail, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
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

export default function ContactPage() {
    return (
        <div className="relative flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-6 sm:py-12">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,hsl(var(--primary)/0.06),transparent)]" />

            {/* Header Section */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center mb-8 sm:mb-12"
            >
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex justify-center mb-4 sm:mb-6"
                >
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm">
                        <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    </div>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4"
                >
                    Send a Message
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                    Have a question, found a bug, or want to suggest something? Fill out the form
                    below and I&apos;ll get back to you.
                </motion.p>
            </motion.section>

            {/* Contact Info Cards */}
            <FadeSection delay={0.1} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                <Card className="border border-border/50 bg-background/50 backdrop-blur-sm transition-colors hover:bg-muted/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm sm:text-base">Email</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Drop me a line
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

                <Card className="border border-border/50 bg-background/50 backdrop-blur-sm transition-colors hover:bg-muted/50">
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
                                    When to expect a reply
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">Usually within a day or two</p>
                    </CardContent>
                </Card>

                {/* Quick Help */}
                <Card className="border border-border/50 bg-background/50 backdrop-blur-sm p-3 sm:p-4 flex flex-col justify-center">
                    <h3 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2">Quick Help</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Before reaching out, you might find answers on the{" "}
                        <Link href="/features" className="text-primary hover:underline font-medium">
                            Features page
                        </Link>{" "}
                        or{" "}
                        <Link href="/about" className="text-primary hover:underline font-medium">
                            About page
                        </Link>
                        .
                    </p>
                </Card>
            </FadeSection>

            {/* Contact Form */}
            <FadeSection delay={0.2}>
                <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-lg sm:text-xl">Send a Message</CardTitle>
                        <CardDescription className="text-sm">
                            All fields are required unless marked optional.
                        </CardDescription>
                    </CardHeader>
                    <div className="mx-4 sm:mx-6 h-px bg-border/50" />
                    <CardContent className="p-4 sm:p-6">
                        <ContactForm />
                    </CardContent>
                </Card>
            </FadeSection>

            {/* Social Links */}
            <FadeSection delay={0.3}>
                <section className="mt-12 sm:mt-16 text-center">
                    <div className="mx-auto mb-6 sm:mb-8 h-px max-w-md bg-gradient-to-r from-transparent via-border to-transparent" />
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                        Find me elsewhere
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">
                        I share updates, tips, and project news here.
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
            </FadeSection>
        </div>
    );
}
