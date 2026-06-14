"use client";

import { CustomQRCodeGenerator } from "@/components/custom-qr-generator";
import { Card } from "@/components/ui/card";
import TopBackButton from "@/components/top-back-button";
import { QrCode, Sparkles } from "lucide-react";
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

export default function QRGeneratorPage() {
    return (
        <div className="relative flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-8">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,hsl(var(--primary)/0.06),transparent)]" />

            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <TopBackButton />
                </motion.div>
                <div className="flex items-center gap-3 mb-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 backdrop-blur-sm"
                    >
                        <QrCode className="h-6 w-6 text-primary" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <h1 className="text-3xl font-bold tracking-tight">
                            Custom QR Code Generator
                        </h1>
                        <p className="text-muted-foreground">
                            Generate QR codes with your colors, logo, and preferred size
                        </p>
                    </motion.div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3"
                >
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>
                        Pick your colors, add your logo, choose a size — then download as PNG, SVG,
                        or PDF.
                    </span>
                </motion.div>
            </div>

            {/* QR Code Generator */}
            <FadeSection delay={0.2}>
                <Card className="border border-border/50 bg-background/50 backdrop-blur-sm p-4 sm:p-6">
                    <CustomQRCodeGenerator />
                </Card>
            </FadeSection>
        </div>
    );
}
