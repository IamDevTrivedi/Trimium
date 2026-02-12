"use client";

import React, { useCallback, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Upload,
    Download,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2,
    Info,
    Trash2,
    Eye,
    RefreshCw,
    HelpCircle,
} from "lucide-react";
import { backend } from "@/config/backend";
import { Toast } from "./toast";
import { PASSWORD, PASSWORD_NOTICE, SHORTCODE, SHORTCODE_NOTICE } from "@/constants/regex";

interface CSVRow {
    rowNumber: number;
    title: string;
    description: string;
    shortCode: string;
    originalURL: string;
    password: string;
    maxTransfers: string;
    scheduleStart: string;
    scheduleEnd: string;
    scheduleMessage: string;
}

interface ValidationResult {
    rowNumber: number;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    data: CSVRow;
}

interface UploadResult {
    rowNumber: number;
    status: "success" | "failed" | "skipped";
    shortCode?: string;
    message: string;
}

const CSV_COLUMNS = [
    {
        name: "title",
        required: true,
        description: "Title of the redirect (1-255 characters)",
        example: "My Marketing Link",
    },
    {
        name: "description",
        required: false,
        description: "Description (max 1024 characters). Leave blank if not needed.",
        example: "Campaign Q1 2025",
    },
    {
        name: "shortCode",
        required: false,
        description:
            "Preferred short code (5-20 chars, alphanumeric, dots, underscores, hyphens). If unavailable, row will be SKIPPED. Leave blank for auto-generated.",
        example: "my-link",
    },
    {
        name: "originalURL",
        required: true,
        description: "The destination URL (must be a valid URL starting with http:// or https://)",
        example: "https://example.com/landing-page",
    },
    {
        name: "password",
        required: false,
        description: `Password protection. ${PASSWORD_NOTICE} Leave blank for no password.`,
        example: "SecurePass123!",
    },
    {
        name: "maxTransfers",
        required: false,
        description:
            "Maximum number of clicks allowed (positive integer). Leave blank for unlimited.",
        example: "1000",
    },
    {
        name: "scheduleStart",
        required: false,
        description:
            "Schedule start date/time in ISO format (YYYY-MM-DDTHH:mm). Must be in the future. Leave blank for no scheduling.",
        example: "2025-02-01T09:00",
    },
    {
        name: "scheduleEnd",
        required: false,
        description:
            "Schedule end date/time in ISO format (YYYY-MM-DDTHH:mm). Must be after scheduleStart. Required if scheduleStart is set.",
        example: "2025-03-01T18:00",
    },
    {
        name: "scheduleMessage",
        required: false,
        description:
            "Message to display when link is not yet active (max 512 chars). Defaults to 'This link is not yet active.'",
        example: "Coming soon!",
    },
];

const generateCSVTemplate = (): string => {
    const headers = CSV_COLUMNS.map((col) => col.name).join(",");
    const exampleRow = CSV_COLUMNS.map((col) => `"${col.example}"`).join(",");
    return `${headers}\n${exampleRow}`;
};

const downloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bulk-shorturl-template.csv";
    link.click();
    window.URL.revokeObjectURL(url);
};

const parseCSV = (content: string): CSVRow[] => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 4) {
            rows.push({
                rowNumber: i + 1,
                title: values[0]?.trim() || "",
                description: values[1]?.trim() || "",
                shortCode: values[2]?.trim() || "",
                originalURL: values[3]?.trim() || "",
                password: values[4]?.trim() || "",
                maxTransfers: values[5]?.trim() || "",
                scheduleStart: values[6]?.trim() || "",
                scheduleEnd: values[7]?.trim() || "",
                scheduleMessage: values[8]?.trim() || "",
            });
        }
    }

    return rows;
};

const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current);

    return values;
};

const validateRow = (row: CSVRow): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!row.title) {
        errors.push("Title is required");
    } else if (row.title.length > 255) {
        errors.push("Title must be 255 characters or less");
    }

    if (row.description && row.description.length > 1024) {
        errors.push("Description must be 1024 characters or less");
    }

    if (row.shortCode) {
        if (!SHORTCODE.test(row.shortCode)) {
            errors.push(SHORTCODE_NOTICE);
        }
    } else {
        warnings.push("No short code provided - will be auto-generated");
    }

    if (!row.originalURL) {
        errors.push("Original URL is required");
    } else {
        try {
            const url = new URL(row.originalURL);
            if (!["http:", "https:"].includes(url.protocol)) {
                errors.push("URL must start with http:// or https://");
            }
        } catch {
            errors.push("Invalid URL format");
        }
    }

    if (row.password) {
        if (!PASSWORD.test(row.password)) {
            errors.push(PASSWORD_NOTICE);
        }
    }

    if (row.maxTransfers) {
        const transfers = parseInt(row.maxTransfers, 10);
        if (isNaN(transfers) || transfers <= 0 || !Number.isInteger(transfers)) {
            errors.push("Max transfers must be a positive integer");
        }
    }

    if (row.scheduleStart || row.scheduleEnd) {
        const startAt = new Date(row.scheduleStart).getTime();
        const endAt = new Date(row.scheduleEnd).getTime();
        const now = Date.now();

        if (row.scheduleStart && isNaN(startAt)) {
            errors.push("Invalid schedule start date format (use YYYY-MM-DDTHH:mm)");
        }

        if (row.scheduleEnd && isNaN(endAt)) {
            errors.push("Invalid schedule end date format (use YYYY-MM-DDTHH:mm)");
        }

        if (row.scheduleStart && !row.scheduleEnd) {
            errors.push("Schedule end date is required when start date is provided");
        }

        if (row.scheduleEnd && !row.scheduleStart) {
            errors.push("Schedule start date is required when end date is provided");
        }

        if (startAt && startAt <= now) {
            errors.push("Schedule start date must be in the future");
        }

        if (endAt && endAt <= now) {
            errors.push("Schedule end date must be in the future");
        }

        if (startAt && endAt && startAt >= endAt) {
            errors.push("Schedule end date must be after start date");
        }
    }

    if (row.scheduleMessage && row.scheduleMessage.length > 512) {
        errors.push("Schedule message must be 512 characters or less");
    }

    return {
        rowNumber: row.rowNumber,
        isValid: errors.length === 0,
        errors,
        warnings,
        data: row,
    };
};

interface BulkUploadProps {
    workspaceID: string;
}

export function BulkUploadURLs({ workspaceID }: BulkUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<CSVRow[]>([]);
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validCount = validationResults.filter((r) => r.isValid).length;
    const invalidCount = validationResults.filter((r) => !r.isValid).length;

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith(".csv")) {
            Toast.error("Please select a CSV file");
            return;
        }

        setFile(selectedFile);
        setUploadResults([]);
        setIsValidating(true);

        try {
            const content = await selectedFile.text();
            const rows = parseCSV(content);

            if (rows.length === 0) {
                Toast.error("No valid rows found in CSV file");
                setIsValidating(false);
                return;
            }

            setParsedRows(rows);

            const results = rows.map(validateRow);
            setValidationResults(results);
            setShowPreview(true);
        } catch (error) {
            Toast.error("Failed to parse CSV file");
        } finally {
            setIsValidating(false);
        }
    }, []);

    const handleBulkUpload = async () => {
        const validRows = validationResults.filter((r) => r.isValid).map((r) => r.data);

        if (validRows.length === 0) {
            Toast.error("No valid rows to upload");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadResults([]);

        const payloadRows = validRows.map((row) => {
            const entry: Record<string, unknown> = {
                rowNumber: row.rowNumber,
                title: row.title,
                originalURL: row.originalURL,
            };

            if (row.description) entry.description = row.description;
            if (row.shortCode) entry.shortCode = row.shortCode;
            if (row.password) entry.password = row.password;
            if (row.maxTransfers) entry.maxTransfers = parseInt(row.maxTransfers, 10);

            if (row.scheduleStart && row.scheduleEnd) {
                entry.schedule = {
                    startAt: new Date(row.scheduleStart).getTime(),
                    endAt: new Date(row.scheduleEnd).getTime(),
                    countdownEnabled: true,
                    messageToDisplay: row.scheduleMessage || "This link is not yet active.",
                };
            }

            return entry;
        });

        try {
            setUploadProgress(50);
            const { data } = await backend.post("/api/v1/url/bulk-create-shortcodes", {
                workspaceID,
                rows: payloadRows,
            });

            setUploadProgress(100);

            if (data?.success && data?.data?.results) {
                const results: UploadResult[] = data.data.results.map(
                    (r: { rowNumber: number; status: string; shortCode?: string; message: string }) => ({
                        rowNumber: r.rowNumber,
                        status: r.status as "success" | "failed" | "skipped",
                        shortCode: r.shortCode,
                        message: r.message,
                    })
                );

                setUploadResults(results);

                const { successCount, failedCount, skippedCount } = data.data.summary;

                if (successCount > 0) Toast.success(`Successfully created ${successCount} short URLs`);
                if (failedCount > 0) Toast.error(`Failed to create ${failedCount} short URLs`);
                if (skippedCount > 0) Toast.info(`Skipped ${skippedCount} short URLs (short codes unavailable)`);
            } else {
                Toast.error(data?.message || "Bulk upload failed");
            }
        } catch (error: any) {
            Toast.error(error?.response?.data?.message || "Bulk upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setParsedRows([]);
        setValidationResults([]);
        setUploadResults([]);
        setShowPreview(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const exportResults = () => {
        if (uploadResults.length === 0) return;

        const headers = "Row,Status,ShortCode,Message";
        const rows = uploadResults.map(
            (r) => `${r.rowNumber},${r.status},${r.shortCode || ""},${r.message}`
        );
        const csvContent = [headers, ...rows].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bulk-upload-results-${Date.now()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Bulk Upload Short URLs</CardTitle>
                            <CardDescription>
                                Upload a CSV file to create multiple short URLs at once
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Template Download Section */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Download CSV Template
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Get the template file with all required columns and example data
                                </p>
                            </div>
                            <Button variant="outline" onClick={downloadTemplate}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>
                        </div>
                    </div>

                    {/* Column Reference */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">CSV Column Reference</h4>
                        </div>
                        <ScrollArea className="h-[250px] rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[150px]">Column</TableHead>
                                        <TableHead className="w-[100px]">Required</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {CSV_COLUMNS.map((col) => (
                                        <TableRow key={col.name}>
                                            <TableCell className="font-mono text-sm">
                                                {col.name}
                                            </TableCell>
                                            <TableCell>
                                                {col.required ? (
                                                    <Badge variant="destructive">Required</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Optional</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {col.description}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>

                    <Separator />

                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <Label htmlFor="csv-file">Upload CSV File</Label>
                        <div className="flex gap-4">
                            <Input
                                ref={fileInputRef}
                                id="csv-file"
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                disabled={isValidating || isUploading}
                                className="flex-1"
                            />
                            {file && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleReset}
                                    disabled={isUploading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                Selected: <span className="font-medium">{file.name}</span> (
                                {(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Validation Loading */}
            {isValidating && (
                <Card>
                    <CardContent className="py-8">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Validating CSV file...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Preview & Validation Results */}
            {showPreview && !isValidating && validationResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Validation Results
                                </CardTitle>
                                <CardDescription>
                                    {parsedRows.length} rows found in CSV file
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium">{validCount} Valid</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-destructive" />
                                    <span className="text-sm font-medium">
                                        {invalidCount} Invalid
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {invalidCount > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Validation Errors</AlertTitle>
                                <AlertDescription>
                                    {invalidCount} row(s) have validation errors and will not be
                                    uploaded. Please fix the errors and re-upload.
                                </AlertDescription>
                            </Alert>
                        )}

                        <ScrollArea className="h-[400px] rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Row</TableHead>
                                        <TableHead className="w-[80px]">Status</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Short Code</TableHead>
                                        <TableHead>URL</TableHead>
                                        <TableHead>Issues</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {validationResults.map((result) => (
                                        <TableRow
                                            key={result.rowNumber}
                                            className={
                                                !result.isValid ? "bg-destructive/5" : undefined
                                            }
                                        >
                                            <TableCell className="font-mono text-sm">
                                                #{result.rowNumber}
                                            </TableCell>
                                            <TableCell>
                                                {result.isValid ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-destructive" />
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate">
                                                {result.data.title || "-"}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {result.data.shortCode || (
                                                    <span className="text-muted-foreground italic">
                                                        auto
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-sm">
                                                {result.data.originalURL}
                                            </TableCell>
                                            <TableCell>
                                                {result.errors.length > 0 && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Badge variant="destructive">
                                                                    {result.errors.length} error(s)
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-sm">
                                                                <ul className="list-disc pl-4 space-y-1">
                                                                    {result.errors.map((e, i) => (
                                                                        <li
                                                                            key={i}
                                                                            className="text-xs"
                                                                        >
                                                                            {e}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                                {result.warnings.length > 0 &&
                                                    result.errors.length === 0 && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Badge variant="outline">
                                                                        <HelpCircle className="h-3 w-3 mr-1" />
                                                                        {result.warnings.length}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-sm">
                                                                    <ul className="list-disc pl-4 space-y-1">
                                                                        {result.warnings.map(
                                                                            (w, i) => (
                                                                                <li
                                                                                    key={i}
                                                                                    className="text-xs"
                                                                                >
                                                                                    {w}
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>

                        {/* Upload Progress */}
                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                onClick={handleBulkUpload}
                                disabled={isUploading || validCount === 0}
                                className="flex-1"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload {validCount} Valid Row(s)
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={handleReset} disabled={isUploading}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Upload Results
                                </CardTitle>
                                <CardDescription>
                                    {uploadResults.filter((r) => r.status === "success").length}{" "}
                                    succeeded,{" "}
                                    {uploadResults.filter((r) => r.status === "failed").length}{" "}
                                    failed,{" "}
                                    {uploadResults.filter((r) => r.status === "skipped").length}{" "}
                                    skipped
                                </CardDescription>
                            </div>
                            <Button variant="outline" onClick={exportResults}>
                                <Download className="h-4 w-4 mr-2" />
                                Export Results
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Row</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead>Short Code</TableHead>
                                        <TableHead>Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploadResults.map((result) => (
                                        <TableRow key={result.rowNumber}>
                                            <TableCell className="font-mono text-sm">
                                                #{result.rowNumber}
                                            </TableCell>
                                            <TableCell>
                                                {result.status === "success" && (
                                                    <Badge className="bg-green-500">Success</Badge>
                                                )}
                                                {result.status === "failed" && (
                                                    <Badge variant="destructive">Failed</Badge>
                                                )}
                                                {result.status === "skipped" && (
                                                    <Badge variant="secondary">Skipped</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {result.shortCode || "-"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {result.message}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
