"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Github, Linkedin, ArrowUp } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="border-t border-border bg-background">
            <div className="container px-4 py-12 max-w-5xl mx-auto">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-xl font-semibold">Trimium</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Professional URL shortening and QR code generation service with advanced
                            analytics and team collaboration features.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Quick Links</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <Link
                                href="/"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Home
                            </Link>
                            <Link
                                href="/features"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Features
                            </Link>
                            <Link
                                href="/w"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Workspaces
                            </Link>
                            <Link
                                href="/qr-generator"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Generate QR Code
                            </Link>
                            <Link
                                href="/linkhub-editor"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                LinkHub
                            </Link>
                            <Link
                                href="/about"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Account */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Account</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <Link
                                href="/create-account"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Create Account
                            </Link>
                            <Link
                                href="/login"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Login
                            </Link>
                            <Link
                                href="/reset-password"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Reset Password
                            </Link>
                            <Link
                                href="/account"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                My account
                            </Link>
                            <Link
                                href="/account/login-activity"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Login Activity
                            </Link>
                            <Link
                                href="/logout"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>

                    {/* Legal & Social */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold">Legal</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <Link
                                href="/privacy-policy"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms-of-service"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/contact-us"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Contact Us
                            </Link>
                        </div>
                        <div className="flex flex-col gap-4 pt-4">
                            <h3 className="font-semibold">Connect</h3>
                            <div className="flex gap-3">
                                <Link
                                    href="mailto:devtrivedi.work@gmail.com"
                                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent hover:text-accent-foreground"
                                    aria-label="Email"
                                >
                                    <Mail className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="https://in.linkedin.com/in/contact-devtrivedi"
                                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent hover:text-accent-foreground"
                                    aria-label="LinkedIn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="https://github.com/IamDevTrivedi"
                                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent hover:text-accent-foreground"
                                    aria-label="GitHub"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Trimium. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={scrollToTop}
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
