"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    QrCode,
    Download,
    Palette,
    RefreshCw,
    Upload,
    Trash2,
    Maximize2,
    Image as ImageIcon,
    Type,
    Layers,
    Settings2,
    Wand2,
    Copy,
    Check,
    Sparkles,
    Link2,
} from "lucide-react";
import { Separator } from "./ui/separator";

// Types
interface QRCodeOptions {
    url: string;
    size: number;
    foregroundColor: string;
    backgroundColor: string;
    margin: number;
    errorCorrectionLevel: "L" | "M" | "Q" | "H";
    logo: string | null;
    logoSize: number;
    logoPadding: number;
    logoBackgroundColor: string;
    logoRounded: boolean;
}

type QRFormat = "png" | "svg" | "jpeg" | "webp";

// Color Presets
const colorPresets = [
    { name: "Classic", fg: "#000000", bg: "#ffffff" },
    { name: "Ocean", fg: "#0ea5e9", bg: "#f0f9ff" },
    { name: "Forest", fg: "#16a34a", bg: "#f0fdf4" },
    { name: "Sunset", fg: "#ea580c", bg: "#fff7ed" },
    { name: "Purple", fg: "#9333ea", bg: "#faf5ff" },
    { name: "Rose", fg: "#e11d48", bg: "#fff1f2" },
    { name: "Midnight", fg: "#f8fafc", bg: "#0f172a" },
    { name: "Coral", fg: "#f43f5e", bg: "#fef2f2" },
    { name: "Emerald", fg: "#059669", bg: "#ecfdf5" },
    { name: "Amber", fg: "#d97706", bg: "#fffbeb" },
    { name: "Indigo", fg: "#4f46e5", bg: "#eef2ff" },
    { name: "Teal", fg: "#0d9488", bg: "#f0fdfa" },
];

// Size Presets
const sizePresets = [
    { name: "Small", size: 128, description: "Social media icons" },
    { name: "Medium", size: 256, description: "Print materials" },
    { name: "Large", size: 512, description: "Posters & banners" },
    { name: "XL", size: 1024, description: "High-res printing" },
];

const defaultOptions: QRCodeOptions = {
    url: "",
    size: 300,
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    margin: 2,
    errorCorrectionLevel: "H",
    logo: null,
    logoSize: 20,
    logoPadding: 5,
    logoBackgroundColor: "#ffffff",
    logoRounded: true,
};

// Helper to safely get first value from slider
const getSliderValue = (value: number | readonly number[]): number => {
    if (Array.isArray(value)) {
        return value[0] ?? 0;
    }
    return value as number;
};

export function CustomQRCodeGenerator() {
    const [options, setOptions] = useState<QRCodeOptions>(defaultOptions);
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("content");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generate QR Code
    const generateQRCode = useCallback(async () => {
        if (!options.url.trim()) {
            setQrDataUrl("");
            return;
        }

        setIsGenerating(true);
        try {
            // Generate base QR code
            const canvas = document.createElement("canvas");
            await QRCode.toCanvas(canvas, options.url, {
                width: options.size,
                margin: options.margin,
                color: {
                    dark: options.foregroundColor,
                    light: options.backgroundColor,
                },
                errorCorrectionLevel: options.errorCorrectionLevel,
            });

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Could not get canvas context");

            // Add logo if present
            if (options.logo) {
                const logoImg = new Image();
                logoImg.crossOrigin = "anonymous";

                await new Promise<void>((resolve, reject) => {
                    logoImg.onload = () => {
                        const logoActualSize = (options.size * options.logoSize) / 100;
                        const logoX = (options.size - logoActualSize) / 2;
                        const logoY = (options.size - logoActualSize) / 2;
                        const padding = options.logoPadding;

                        // Draw logo background with optional rounded corners
                        ctx.fillStyle = options.logoBackgroundColor;
                        if (options.logoRounded) {
                            const radius = 8;
                            ctx.beginPath();
                            ctx.roundRect(
                                logoX - padding,
                                logoY - padding,
                                logoActualSize + padding * 2,
                                logoActualSize + padding * 2,
                                radius
                            );
                            ctx.fill();
                        } else {
                            ctx.fillRect(
                                logoX - padding,
                                logoY - padding,
                                logoActualSize + padding * 2,
                                logoActualSize + padding * 2
                            );
                        }

                        // Draw logo image
                        if (options.logoRounded) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.roundRect(logoX, logoY, logoActualSize, logoActualSize, 6);
                            ctx.clip();
                            ctx.drawImage(logoImg, logoX, logoY, logoActualSize, logoActualSize);
                            ctx.restore();
                        } else {
                            ctx.drawImage(logoImg, logoX, logoY, logoActualSize, logoActualSize);
                        }

                        resolve();
                    };
                    logoImg.onerror = reject;
                    logoImg.src = options.logo!;
                });
            }

            setQrDataUrl(canvas.toDataURL("image/png"));
        } catch (error) {
            console.error("Error generating QR code:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [options]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            generateQRCode();
        }, 300);
        return () => clearTimeout(debounce);
    }, [generateQRCode]);

    // Handle logo upload
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOptions((prev) => ({ ...prev, logo: e.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setOptions((prev) => ({ ...prev, logo: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Download QR Code
    const downloadQRCode = async (format: QRFormat) => {
        if (!qrDataUrl) return;

        const filename = `qr-code-${Date.now()}`;

        if (format === "svg") {
            try {
                const svgString = await QRCode.toString(options.url, {
                    type: "svg",
                    width: options.size,
                    margin: options.margin,
                    color: {
                        dark: options.foregroundColor,
                        light: options.backgroundColor,
                    },
                    errorCorrectionLevel: options.errorCorrectionLevel,
                });
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.download = `${filename}.svg`;
                link.href = url;
                link.click();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Error generating SVG:", error);
            }
        } else {
            // Convert to other formats
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
                canvas.width = options.size;
                canvas.height = options.size;
                ctx?.drawImage(img, 0, 0);

                let mimeType = "image/png";
                if (format === "jpeg") mimeType = "image/jpeg";
                if (format === "webp") mimeType = "image/webp";

                const dataUrl = canvas.toDataURL(mimeType, 0.95);
                const link = document.createElement("a");
                link.download = `${filename}.${format}`;
                link.href = dataUrl;
                link.click();
            };
            img.src = qrDataUrl;
        }
    };

    // Copy QR Code to clipboard
    const copyToClipboard = async () => {
        if (!qrDataUrl) return;

        try {
            const response = await fetch(qrDataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    // Apply color preset
    const applyColorPreset = (fg: string, bg: string) => {
        setOptions((prev) => ({ ...prev, foregroundColor: fg, backgroundColor: bg }));
    };

    // Apply size preset
    const applySizePreset = (size: number) => {
        setOptions((prev) => ({ ...prev, size }));
    };

    // Randomize colors
    const randomizeColors = () => {
        const randomColor = () =>
            "#" +
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0");
        setOptions((prev) => ({
            ...prev,
            foregroundColor: randomColor(),
            backgroundColor: randomColor(),
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Options Panel */}
            <div className="lg:col-span-3 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="content" className="gap-2">
                            <Link2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Content</span>
                        </TabsTrigger>
                        <TabsTrigger value="style" className="gap-2">
                            <Palette className="h-4 w-4" />
                            <span className="hidden sm:inline">Style</span>
                        </TabsTrigger>
                        <TabsTrigger value="logo" className="gap-2">
                            <ImageIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Logo</span>
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="gap-2">
                            <Settings2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Advanced</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Content Tab */}
                    <TabsContent value="content">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Link2 className="h-5 w-5" />
                                    QR Code Content
                                </CardTitle>
                                <CardDescription>
                                    Enter the URL or text you want to encode
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url">URL or Text</Label>
                                    <Input
                                        id="url"
                                        type="text"
                                        placeholder="https://example.com or any text"
                                        value={options.url}
                                        onChange={(e) =>
                                            setOptions((prev) => ({ ...prev, url: e.target.value }))
                                        }
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This can be a website URL, text, email, phone number, or any
                                        content
                                    </p>
                                </div>

                                {/* Quick URLs */}
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Quick Examples</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: "Website", value: "https://example.com" },
                                            {
                                                label: "Email",
                                                value: "mailto:hello@example.com",
                                            },
                                            { label: "Phone", value: "tel:+1234567890" },
                                            { label: "SMS", value: "sms:+1234567890" },
                                        ].map((item) => (
                                            <Button
                                                key={item.label}
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        url: item.value,
                                                    }))
                                                }
                                            >
                                                {item.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Style Tab */}
                    <TabsContent value="style">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Colors & Style
                                </CardTitle>
                                <CardDescription>
                                    Customize the appearance of your QR code
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Color Presets */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Color Presets</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={randomizeColors}
                                            className="h-8"
                                        >
                                            <Wand2 className="h-4 w-4 mr-1" />
                                            Random
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {colorPresets.map((preset) => (
                                            <button
                                                key={preset.name}
                                                onClick={() =>
                                                    applyColorPreset(preset.fg, preset.bg)
                                                }
                                                className={`group relative flex flex-col items-center p-2 rounded-lg border transition-all hover:scale-105 ${
                                                    options.foregroundColor === preset.fg &&
                                                    options.backgroundColor === preset.bg
                                                        ? "ring-2 ring-primary ring-offset-2"
                                                        : "hover:border-primary/50"
                                                }`}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-md border shadow-sm mb-1"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
                                                    }}
                                                />
                                                <span className="text-[10px] font-medium truncate w-full text-center">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Custom Colors */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fg-color">Foreground Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="fg-color"
                                                type="color"
                                                value={options.foregroundColor}
                                                onChange={(e) =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        foregroundColor: e.target.value,
                                                    }))
                                                }
                                                className="w-12 h-9 p-1 cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={options.foregroundColor}
                                                onChange={(e) =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        foregroundColor: e.target.value,
                                                    }))
                                                }
                                                className="flex-1 font-mono text-xs uppercase"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bg-color">Background Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="bg-color"
                                                type="color"
                                                value={options.backgroundColor}
                                                onChange={(e) =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        backgroundColor: e.target.value,
                                                    }))
                                                }
                                                className="w-12 h-9 p-1 cursor-pointer"
                                            />
                                            <Input
                                                type="text"
                                                value={options.backgroundColor}
                                                onChange={(e) =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        backgroundColor: e.target.value,
                                                    }))
                                                }
                                                className="flex-1 font-mono text-xs uppercase"
                                                placeholder="#ffffff"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Size Presets */}
                                <div className="space-y-3">
                                    <Label>Size Presets</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {sizePresets.map((preset) => (
                                            <button
                                                key={preset.name}
                                                onClick={() => applySizePreset(preset.size)}
                                                className={`p-3 rounded-lg border text-left transition-all ${
                                                    options.size === preset.size
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "hover:border-primary/50"
                                                }`}
                                            >
                                                <div className="font-medium text-sm">
                                                    {preset.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {preset.size}px
                                                </div>
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                    {preset.description}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Size */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Custom Size</Label>
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {options.size}px
                                        </span>
                                    </div>
                                    <Slider
                                        value={[options.size]}
                                        onValueChange={(value) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                size: getSliderValue(value),
                                            }))
                                        }
                                        min={64}
                                        max={2048}
                                        step={8}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>64px</span>
                                        <span>2048px</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Logo Tab */}
                    <TabsContent value="logo">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Brand Logo
                                </CardTitle>
                                <CardDescription>
                                    Add your brand logo to the center of the QR code
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Logo Upload */}
                                <div className="space-y-3">
                                    <Label>Upload Logo</Label>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/50 ${
                                            options.logo ? "border-primary bg-primary/5" : ""
                                        }`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        {options.logo ? (
                                            <div className="space-y-3">
                                                <div className="relative inline-block">
                                                    <img
                                                        src={options.logo}
                                                        alt="Logo preview"
                                                        className="max-h-24 max-w-24 mx-auto rounded-lg object-contain"
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Click to change logo
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                                                <p className="text-sm font-medium">
                                                    Click to upload your logo
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG, SVG up to 5MB
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {options.logo && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={removeLogo}
                                            className="w-full"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove Logo
                                        </Button>
                                    )}
                                </div>

                                {options.logo && (
                                    <>
                                        <Separator />

                                        {/* Logo Size */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label>Logo Size</Label>
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    {options.logoSize}%
                                                </span>
                                            </div>
                                            <Slider
                                                value={[options.logoSize]}
                                                onValueChange={(value) =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        logoSize: getSliderValue(value),
                                                    }))
                                                }
                                                min={10}
                                                max={35}
                                                step={1}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Recommended: 20-25% for best scanability
                                            </p>
                                        </div>

                                        {/* Logo Padding */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label>Logo Padding</Label>
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    {options.logoPadding}px
                                                </span>
                                            </div>
                                            <Slider
                                                value={[options.logoPadding]}
                                                onValueChange={(value) =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        logoPadding: getSliderValue(value),
                                                    }))
                                                }
                                                min={0}
                                                max={20}
                                                step={1}
                                            />
                                        </div>

                                        {/* Logo Background Color */}
                                        <div className="space-y-2">
                                            <Label>Logo Background</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={options.logoBackgroundColor}
                                                    onChange={(e) =>
                                                        setOptions((prev) => ({
                                                            ...prev,
                                                            logoBackgroundColor: e.target.value,
                                                        }))
                                                    }
                                                    className="w-12 h-9 p-1 cursor-pointer"
                                                />
                                                <Input
                                                    type="text"
                                                    value={options.logoBackgroundColor}
                                                    onChange={(e) =>
                                                        setOptions((prev) => ({
                                                            ...prev,
                                                            logoBackgroundColor: e.target.value,
                                                        }))
                                                    }
                                                    className="flex-1 font-mono text-xs uppercase"
                                                />
                                            </div>
                                        </div>

                                        {/* Rounded Corners */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Rounded Corners</Label>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Apply rounded corners to logo background
                                                </p>
                                            </div>
                                            <Button
                                                variant={
                                                    options.logoRounded ? "default" : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        logoRounded: !prev.logoRounded,
                                                    }))
                                                }
                                            >
                                                {options.logoRounded ? "On" : "Off"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings2 className="h-5 w-5" />
                                    Advanced Settings
                                </CardTitle>
                                <CardDescription>
                                    Fine-tune your QR code generation settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Error Correction Level */}
                                <div className="space-y-3">
                                    <Label>Error Correction Level</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            {
                                                level: "L" as const,
                                                name: "Low",
                                                recovery: "7%",
                                            },
                                            {
                                                level: "M" as const,
                                                name: "Medium",
                                                recovery: "15%",
                                            },
                                            {
                                                level: "Q" as const,
                                                name: "Quartile",
                                                recovery: "25%",
                                            },
                                            {
                                                level: "H" as const,
                                                name: "High",
                                                recovery: "30%",
                                            },
                                        ].map((item) => (
                                            <button
                                                key={item.level}
                                                onClick={() =>
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        errorCorrectionLevel: item.level,
                                                    }))
                                                }
                                                className={`p-3 rounded-lg border text-left transition-all ${
                                                    options.errorCorrectionLevel === item.level
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "hover:border-primary/50"
                                                }`}
                                            >
                                                <div className="font-bold text-lg">
                                                    {item.level}
                                                </div>
                                                <div className="text-xs font-medium">
                                                    {item.name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {item.recovery} recovery
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Higher levels allow more damage recovery but create denser
                                        codes. Use &quot;High&quot; when adding a logo.
                                    </p>
                                </div>

                                <Separator />

                                {/* Margin */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Quiet Zone (Margin)</Label>
                                        <span className="text-sm font-mono text-muted-foreground">
                                            {options.margin} modules
                                        </span>
                                    </div>
                                    <Slider
                                        value={[options.margin]}
                                        onValueChange={(value) =>
                                            setOptions((prev) => ({
                                                ...prev,
                                                margin: getSliderValue(value),
                                            }))
                                        }
                                        min={0}
                                        max={10}
                                        step={1}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: 2-4 modules for reliable scanning
                                    </p>
                                </div>

                                <Separator />

                                {/* Reset */}
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setOptions({ ...defaultOptions, url: options.url })
                                    }
                                    className="w-full"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reset to Defaults
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Preview
                        </CardTitle>
                        <CardDescription>Your QR code updates in real-time</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* QR Code Preview */}
                        <div className="flex justify-center">
                            <div
                                className="relative p-4 rounded-xl border-2 border-dashed border-muted-foreground/25 transition-colors"
                                style={{ backgroundColor: options.backgroundColor }}
                            >
                                {isGenerating ? (
                                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt="QR Code"
                                        className="w-[200px] h-[200px] object-contain"
                                    />
                                ) : (
                                    <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                                        <QrCode className="h-12 w-12 mb-2 opacity-30" />
                                        <span className="text-sm">
                                            Enter a URL or text to generate QR code
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* URL Display */}
                        {options.url && (
                            <p className="text-xs text-muted-foreground text-center truncate max-w-full px-2">
                                {options.url}
                            </p>
                        )}

                        {/* Stats */}
                        {qrDataUrl && (
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="p-2 rounded-lg bg-muted/50">
                                    <div className="text-sm font-semibold">{options.size}px</div>
                                    <div className="text-[10px] text-muted-foreground">Size</div>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/50">
                                    <div className="text-sm font-semibold">
                                        {options.errorCorrectionLevel}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Error Level
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Actions */}
                        <div className="space-y-3">
                            {/* Copy Button */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={copyToClipboard}
                                disabled={!qrDataUrl}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy to Clipboard
                                    </>
                                )}
                            </Button>

                            {/* Download Buttons */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                    Download Format
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(["png", "svg", "jpeg", "webp"] as QRFormat[]).map(
                                        (format) => (
                                            <Button
                                                key={format}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadQRCode(format)}
                                                disabled={!qrDataUrl}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                {format.toUpperCase()}
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>

                            <p className="text-[10px] text-muted-foreground text-center">
                                SVG format recommended for print & scaling
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
