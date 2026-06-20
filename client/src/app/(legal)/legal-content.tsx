"use client";

import { Card } from "@/components/ui/card";
import { MarkdownContent } from "@/components/markdown-content";
import { FileText } from "lucide-react";
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

export function LegalContent({
    title,
    lastUpdate,
    content,
}: {
    title: string;
    lastUpdate: string;
    content: string;
}) {
    return (
        <div className="relative flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-6 sm:py-12">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,hsl(var(--primary)/0.06),transparent)]" />

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
                        <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    </div>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4"
                >
                    {title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-sm text-muted-foreground"
                >
                    Last Updated: {lastUpdate}
                </motion.p>
            </motion.section>

            <FadeSection delay={0.1}>
                <Card className="border border-border/50 bg-background/50 backdrop-blur-sm p-6 sm:p-8">
                    <MarkdownContent content={content} />
                </Card>
            </FadeSection>
        </div>
    );
}
