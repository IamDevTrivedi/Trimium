"use client";

import Link from "next/link";
import { CircleAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function Page() {
    return (
        <main className="relative min-h-screen md:min-h-screen flex items-center justify-center px-6 py-24 bg-background">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,hsl(var(--primary)/0.06),transparent)]" />

            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center text-center gap-4 max-w-prose border border-border/50 bg-background/50 backdrop-blur-sm rounded-xl p-8 sm:p-12"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <CircleAlert className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="text-balance text-2xl md:text-3xl font-semibold tracking-tight"
                >
                    Page not found
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="text-pretty leading-relaxed text-muted-foreground"
                >
                    The page you're looking for doesn't exist, was moved, is temporarily
                    unavailable, or you don't have permission to view it.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="pt-2"
                >
                    <Button>
                        <Link href="/" aria-label="Back to home" className="flex items-center">
                            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                            Back to Home
                        </Link>
                    </Button>
                </motion.div>
            </motion.section>
        </main>
    );
}
