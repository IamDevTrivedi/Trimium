"use client";

import React from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { QrCode, Download, Palette, RefreshCw } from "lucide-react";

interface QRCodeGeneratorProps {
    url: string;
    shortCode: string;
}

type QRFormat = "png" | "svg";

export function QRCodeGenerator({ url, shortCode }: QRCodeGeneratorProps) {
    const [qrDataUrl, setQrDataUrl] = React.useState<string>("");
    const [qrSvg, setQrSvg] = React.useState<string>("");
    const [foregroundColor, setForegroundColor] = React.useState<string>("#000000");
    const [backgroundColor, setBackgroundColor] = React.useState<string>("#ffffff");
    const [isGenerating, setIsGenerating] = React.useState<boolean>(false);

    const generateQRCode = React.useCallback(async () => {
        setIsGenerating(true);
        try {
            const dataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor,
                },
                errorCorrectionLevel: "H",
            });
            setQrDataUrl(dataUrl);

            // Generate SVG string
            const svgString = await QRCode.toString(url, {
                type: "svg",
                width: 300,
                margin: 2,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor,
                },
                errorCorrectionLevel: "H",
            });
            setQrSvg(svgString);
        } catch (error) {
            console.error("Error generating QR code:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [url, foregroundColor, backgroundColor]);

    React.useEffect(() => {
        generateQRCode();
    }, [generateQRCode]);

    const downloadQRCode = (format: QRFormat) => {
        const filename = `qr-${shortCode}-${new Date().toISOString()}`;

        if (format === "png") {
            const link = document.createElement("a");
            link.download = `${filename}.png`;
            link.href = qrDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === "svg") {
            const blob = new Blob([qrSvg], { type: "image/svg+xml" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `${filename}.svg`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    };

    const presetColors = [
        { name: "Classic", fg: "#000000", bg: "#ffffff" },
        { name: "Ocean", fg: "#0ea5e9", bg: "#f0f9ff" },
        { name: "Forest", fg: "#16a34a", bg: "#f0fdf4" },
        { name: "Sunset", fg: "#ea580c", bg: "#fff7ed" },
        { name: "Purple", fg: "#9333ea", bg: "#faf5ff" },
        { name: "Rose", fg: "#e11d48", bg: "#fff1f2" },
    ];

    const applyPreset = (fg: string, bg: string) => {
        setForegroundColor(fg);
        setBackgroundColor(bg);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Generator
                </CardTitle>
                <CardDescription>
                    Create beautiful, branded QR codes with customization options
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* QR Code Preview */}
                    <div className="flex flex-col items-center justify-center">
                        <div
                            className="relative p-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20"
                            style={{ backgroundColor: backgroundColor }}
                        >
                            {isGenerating ? (
                                <div className="w-[200px] h-[200px] flex items-center justify-center">
                                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    className="w-[200px] h-[200px]"
                                />
                            ) : (
                                <div className="w-[200px] h-[200px] flex items-center justify-center text-muted-foreground">
                                    Generating...
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 text-center max-w-[200px] truncate">
                            {url}
                        </p>
                    </div>

                    {/* Customization Options */}
                    <div className="space-y-5">
                        {/* Color Presets */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Color Presets
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {presetColors.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset.fg, preset.bg)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all hover:scale-105 ${
                                            foregroundColor === preset.fg &&
                                            backgroundColor === preset.bg
                                                ? "ring-2 ring-primary ring-offset-2"
                                                : ""
                                        }`}
                                        style={{
                                            backgroundColor: preset.bg,
                                            color: preset.fg,
                                            borderColor: preset.fg + "40",
                                        }}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Colors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fg-color">Foreground Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="fg-color"
                                        type="color"
                                        value={foregroundColor}
                                        onChange={(e) => setForegroundColor(e.target.value)}
                                        className="w-12 h-9 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={foregroundColor}
                                        onChange={(e) => setForegroundColor(e.target.value)}
                                        className="flex-1 font-mono text-xs"
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
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="w-12 h-9 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="flex-1 font-mono text-xs"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Download Buttons */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download QR Code
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadQRCode("png")}
                                    disabled={!qrDataUrl}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    PNG
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadQRCode("svg")}
                                    disabled={!qrSvg}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    SVG
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                SVG format is recommended for printing and scaling
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
