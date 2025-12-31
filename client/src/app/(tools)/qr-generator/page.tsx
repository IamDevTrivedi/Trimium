"use client";

import { CustomQRCodeGenerator } from "@/components/custom-qr-generator";
import TopBackButton from "@/components/top-back-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QRGeneratorPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col bg-background w-full max-w-5xl mx-auto px-4 py-8 my-12">
            {/* Header */}
            <div className="mb-8">
                <TopBackButton />
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <QrCode className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Custom QR Code Generator
                        </h1>
                        <p className="text-muted-foreground">
                            Create stunning, branded QR codes for your business
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>
                        Generate professional QR codes with custom colors, sizes, and your brand
                        logo
                    </span>
                </div>
            </div>

            {/* QR Code Generator */}
            <CustomQRCodeGenerator />
        </div>
    );
}
