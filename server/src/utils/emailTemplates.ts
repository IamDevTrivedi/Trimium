import { LocationData } from "@/middlewares/location";
import { readableDate, readableTime } from "./date";
import { ParsedUA } from "@/middlewares/UAParser";
import { config } from "@config/env";

type EmailActionTone = "primary" | "danger";

interface EmailAction {
    label: string;
    href: string;
    tone?: EmailActionTone;
}

interface EmailShellOptions {
    badge: string;
    title: string;
    intro: string;
    content: string;
    action?: EmailAction;
    outro?: string;
}

const EMAIL_THEME = {
    pageBackground: "#f6f5fb",
    cardBackground: "#ffffff",
    border: "#e5e7eb",
    text: "#111827",
    muted: "#6b7280",
    primary: "#7c3aed",
    primarySoft: "#f3e8ff",
    primarySoftText: "#6d28d9",
    danger: "#dc2626",
    dangerSoft: "#fee2e2",
    dangerSoftText: "#b91c1c",
} as const;

const FONT_STACK =
    "Geist, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO_FONT_STACK =
    "'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

const normalizeValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) {
        return "Unknown";
    }

    const normalized = String(value).trim();
    if (normalized.length === 0) {
        return "Unknown";
    }

    return normalized;
};

const safeText = (value: string | number | null | undefined): string => {
    return escapeHtml(normalizeValue(value));
};

const withVersion = (name: string, version: string): string => {
    const normalizedName = normalizeValue(name);
    const normalizedVersion = normalizeValue(version);

    if (normalizedVersion.toLowerCase() === "unknown") {
        return normalizedName;
    }

    return `${normalizedName} ${normalizedVersion}`.trim();
};

const actionButton = (action: EmailAction): string => {
    const isDanger = action.tone === "danger";

    return `
        <a href="${escapeHtml(action.href)}"
            style="display:inline-block;margin-top:20px;padding:12px 18px;background:${isDanger ? EMAIL_THEME.danger : EMAIL_THEME.primary};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
            ${escapeHtml(action.label)}
        </a>
    `;
};

const otpCard = (OTP: string): string => {
    return `
        <div style="margin:20px 0;padding:18px;border:1px solid ${EMAIL_THEME.border};background:${EMAIL_THEME.primarySoft};border-radius:12px;text-align:center;">
            <p style="margin:0;color:${EMAIL_THEME.primarySoftText};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Verification Code</p>
            <p style="margin:10px 0 6px;color:${EMAIL_THEME.primary};font-family:${MONO_FONT_STACK};font-size:32px;font-weight:700;letter-spacing:8px;line-height:1;">${safeText(OTP)}</p>
            <p style="margin:0;color:${EMAIL_THEME.muted};font-size:12px;line-height:18px;">This code expires in 5 minutes.</p>
        </div>
    `;
};

const detailsTable = (
    title: string,
    rows: Array<{ label: string; value: string | number | null | undefined }>
): string => {
    const detailsRows = rows
        .map((row) => {
            return `
                <tr>
                    <td style="padding:8px 0;color:${EMAIL_THEME.muted};font-size:13px;line-height:18px;width:145px;vertical-align:top;">${escapeHtml(row.label)}</td>
                    <td style="padding:8px 0;color:${EMAIL_THEME.text};font-size:13px;line-height:18px;font-weight:500;vertical-align:top;">${safeText(row.value)}</td>
                </tr>
            `;
        })
        .join("");

    return `
        <div style="margin:20px 0 0;padding:16px;border:1px solid ${EMAIL_THEME.border};background:#fafafa;border-radius:12px;">
            <p style="margin:0 0 10px;color:${EMAIL_THEME.text};font-size:14px;font-weight:600;line-height:20px;">${escapeHtml(title)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                ${detailsRows}
            </table>
        </div>
    `;
};

const bulletList = (items: string[]): string => {
    const content = items
        .map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`)
        .join("");

    return `
        <ul style="margin:12px 0 0 18px;padding:0;color:${EMAIL_THEME.text};font-size:14px;line-height:22px;">
            ${content}
        </ul>
    `;
};

const createEmailShell = ({
    badge,
    title,
    intro,
    content,
    action,
    outro,
}: EmailShellOptions): string => {
    return `
<!doctype html>
<html lang="en">
    <body style="margin:0;padding:0;background:${EMAIL_THEME.pageBackground};font-family:${FONT_STACK};">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:${EMAIL_THEME.pageBackground};">
            <tr>
                <td align="center" style="padding:24px 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;border-collapse:collapse;">
                        <tr>
                            <td style="padding:0 0 12px 4px;color:${EMAIL_THEME.muted};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Trimium</td>
                        </tr>
                        <tr>
                            <td style="background:${EMAIL_THEME.cardBackground};border:1px solid ${EMAIL_THEME.border};border-radius:14px;overflow:hidden;">
                                <div style="height:6px;background:${EMAIL_THEME.primary};"></div>
                                <div style="padding:26px 24px;">
                                    <p style="display:inline-block;margin:0 0 14px;padding:6px 10px;border-radius:999px;background:${EMAIL_THEME.primarySoft};color:${EMAIL_THEME.primarySoftText};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(badge)}</p>
                                    <h1 style="margin:0 0 10px;color:${EMAIL_THEME.text};font-size:24px;line-height:30px;font-weight:700;">${escapeHtml(title)}</h1>
                                    <p style="margin:0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">${escapeHtml(intro)}</p>
                                    ${content}
                                    ${action ? actionButton(action) : ""}
                                    ${
                                        outro
                                            ? `<p style="margin:18px 0 0;color:${EMAIL_THEME.muted};font-size:13px;line-height:20px;">${escapeHtml(outro)}</p>`
                                            : ""
                                    }
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:12px 6px 0;text-align:center;color:${EMAIL_THEME.muted};font-size:12px;line-height:18px;">
                                Sent by Trimium · Professional URL management and analytics<br/>
                                <a href="${escapeHtml(config.FRONTEND_URL)}" style="color:${EMAIL_THEME.primary};text-decoration:none;">Open Trimium</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
`;
};

export const emailTemplates = {
    sendOTPForCreateAccount: ({ OTP }: { OTP: string }) => {
        return createEmailShell({
            badge: "Account Verification",
            title: "Verify your Trimium account",
            intro: "Use the one-time code below to complete your account setup.",
            content: `
                ${otpCard(OTP)}
                <p style="margin:0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">
                    If you did not start this request, you can safely ignore this email.
                </p>
            `,
        });
    },

    sendOTPForResetPassword: ({
        OTP,
        UAinfo,
        locationData,
        IPAddress,
    }: {
        OTP: string;
        UAinfo: ParsedUA;
        locationData: LocationData;
        IPAddress: string;
    }) => {
        return createEmailShell({
            badge: "Password Security",
            title: "Password reset verification",
            intro: "A password reset was requested for your Trimium account. Use this code to continue.",
            content: `
                ${otpCard(OTP)}
                ${detailsTable("Request details", [
                    {
                        label: "Browser",
                        value: withVersion(UAinfo.browser.name, UAinfo.browser.version),
                    },
                    {
                        label: "Operating system",
                        value: withVersion(UAinfo.os.name, UAinfo.os.version),
                    },
                    {
                        label: "Device",
                        value: UAinfo.device.type,
                    },
                    {
                        label: "Location",
                        value: locationData.displayName,
                    },
                    {
                        label: "Coordinates",
                        value: `${locationData.lat}, ${locationData.lon}`,
                    },
                    {
                        label: "IP address",
                        value: IPAddress,
                    },
                    {
                        label: "Time",
                        value: `${readableDate()} at ${readableTime()}`,
                    },
                ])}
                <p style="margin:16px 0 0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">
                    If this wasn't you, do not use the code and reset your password immediately after this message.
                </p>
            `,
        });
    },

    loginAlert: ({
        UAinfo,
        locationData,
        IPAddress,
        emailLogoutLink,
    }: {
        UAinfo: ParsedUA;
        locationData: LocationData;
        IPAddress: string;
        emailLogoutLink: string;
    }) => {
        return createEmailShell({
            badge: "Security Alert",
            title: "New login detected",
            intro: "We noticed a login to your account from a new session.",
            content: `
                ${detailsTable("Login details", [
                    {
                        label: "Browser",
                        value: withVersion(UAinfo.browser.name, UAinfo.browser.version),
                    },
                    {
                        label: "Operating system",
                        value: withVersion(UAinfo.os.name, UAinfo.os.version),
                    },
                    {
                        label: "Device",
                        value: UAinfo.device.type,
                    },
                    {
                        label: "Location",
                        value: locationData.displayName,
                    },
                    {
                        label: "Coordinates",
                        value: `${locationData.lat}, ${locationData.lon}`,
                    },
                    {
                        label: "IP address",
                        value: IPAddress,
                    },
                    {
                        label: "Time",
                        value: `${readableDate()} at ${readableTime()}`,
                    },
                ])}
                <p style="margin:16px 0 0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">
                    If this was you, no action is required. If not, revoke this session immediately.
                </p>
            `,
            action: {
                label: "Revoke This Session",
                href: emailLogoutLink,
                tone: "danger",
            },
            outro: "For your safety, review recent activity and update your password if needed.",
        });
    },

    workspaceInvitationTemplate: ({
        workspaceTitle,
        description,
        permission,
        senderName,
    }: {
        workspaceTitle: string;
        description: string;
        permission: "admin" | "member" | "viewer";
        senderName: string;
    }) => {
        const permissionLabel = permission.charAt(0).toUpperCase() + permission.slice(1);

        return createEmailShell({
            badge: "Workspace Invitation",
            title: "You've been invited to collaborate",
            intro: "Join your team workspace in Trimium and start managing links together.",
            content: `
                <div style="margin:20px 0;padding:16px;border:1px solid ${EMAIL_THEME.border};background:${EMAIL_THEME.primarySoft};border-radius:12px;">
                    <p style="margin:0;color:${EMAIL_THEME.primarySoftText};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Workspace</p>
                    <p style="margin:8px 0 0;color:${EMAIL_THEME.text};font-size:18px;line-height:24px;font-weight:700;">${safeText(workspaceTitle)}</p>
                    <p style="margin:8px 0 0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">${safeText(description)}</p>
                </div>
                ${detailsTable("Invitation details", [
                    {
                        label: "Permission",
                        value: permissionLabel,
                    },
                    {
                        label: "Invited by",
                        value: senderName,
                    },
                ])}
                <p style="margin:16px 0 0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">
                    If you do not have an account yet, you will be prompted to create one after opening the invite.
                </p>
            `,
            action: {
                label: "Join Workspace",
                href: `${config.FRONTEND_URL}/w?tab=pending`,
                tone: "primary",
            },
        });
    },

    contactFormSubmissionReceived: ({
        firstName,
        lastName,
        subject,
        submissionID,
    }: {
        firstName: string;
        lastName: string;
        subject: string;
        submissionID: string;
    }) => {
        return createEmailShell({
            badge: "Support",
            title: "We received your message",
            intro: `Hi ${normalizeValue(firstName)} ${normalizeValue(lastName)}, thanks for contacting Trimium support.`,
            content: `
                ${detailsTable("Submission details", [
                    {
                        label: "Subject",
                        value: subject,
                    },
                    {
                        label: "Submission ID",
                        value: submissionID,
                    },
                    {
                        label: "Received",
                        value: `${readableDate()} at ${readableTime()}`,
                    },
                ])}
                <p style="margin:16px 0 0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">
                    Our team will review your message and respond as soon as possible.
                </p>
            `,
            outro: "Best regards, The Trimium Team",
        });
    },

    failedLoginWarning: ({
        attemptCount,
        maxAttempts,
        UAinfo,
        locationData,
        IPAddress,
    }: {
        attemptCount: number;
        maxAttempts: number;
        UAinfo: ParsedUA;
        locationData: LocationData;
        IPAddress: string;
    }) => {
        return createEmailShell({
            badge: "Security Alert",
            title: "Failed login attempts detected",
            intro: `We detected ${attemptCount} failed login attempts. Your account will be temporarily locked after ${maxAttempts} failed attempts.`,
            content: `
                ${detailsTable("Latest attempt", [
                    {
                        label: "Browser",
                        value: withVersion(UAinfo.browser.name, UAinfo.browser.version),
                    },
                    {
                        label: "Operating system",
                        value: withVersion(UAinfo.os.name, UAinfo.os.version),
                    },
                    {
                        label: "Device",
                        value: UAinfo.device.type,
                    },
                    {
                        label: "Location",
                        value: locationData.displayName,
                    },
                    {
                        label: "IP address",
                        value: IPAddress,
                    },
                    {
                        label: "Time",
                        value: `${readableDate()} at ${readableTime()}`,
                    },
                ])}
                <div style="margin:16px 0 0;padding:14px;border-radius:10px;border:1px solid ${EMAIL_THEME.dangerSoft};background:${EMAIL_THEME.dangerSoft};">
                    <p style="margin:0;color:${EMAIL_THEME.dangerSoftText};font-size:13px;line-height:20px;">
                        If this wasn't you, secure your account immediately by resetting your password.
                    </p>
                </div>
            `,
            action: {
                label: "Reset Password",
                href: `${config.FRONTEND_URL}/reset-password`,
                tone: "danger",
            },
        });
    },

    accountLockout: ({
        cooldownMinutes,
        UAinfo,
        locationData,
        IPAddress,
    }: {
        cooldownMinutes: number;
        UAinfo: ParsedUA;
        locationData: LocationData;
        IPAddress: string;
    }) => {
        return createEmailShell({
            badge: "Account Protection",
            title: "Account temporarily locked",
            intro: `Your account has been locked for ${cooldownMinutes} minutes due to multiple failed login attempts.`,
            content: `
                ${detailsTable("Last failed attempt", [
                    {
                        label: "Browser",
                        value: withVersion(UAinfo.browser.name, UAinfo.browser.version),
                    },
                    {
                        label: "Operating system",
                        value: withVersion(UAinfo.os.name, UAinfo.os.version),
                    },
                    {
                        label: "Device",
                        value: UAinfo.device.type,
                    },
                    {
                        label: "Location",
                        value: locationData.displayName,
                    },
                    {
                        label: "IP address",
                        value: IPAddress,
                    },
                    {
                        label: "Time",
                        value: `${readableDate()} at ${readableTime()}`,
                    },
                ])}
                <p style="margin:16px 0 0;color:${EMAIL_THEME.muted};font-size:14px;line-height:22px;">
                    If this was you, wait for the cooldown and try again with the correct password.
                </p>
                <div style="margin:14px 0 0;padding:14px;border-radius:10px;border:1px solid ${EMAIL_THEME.dangerSoft};background:${EMAIL_THEME.dangerSoft};">
                    <p style="margin:0;color:${EMAIL_THEME.dangerSoftText};font-size:13px;line-height:20px;font-weight:600;">
                        If this wasn't you, someone may be trying to access your account.
                    </p>
                    ${bulletList([
                        "Change your password immediately after the lockout expires.",
                        "Review your recent account activity and active sessions.",
                    ])}
                </div>
            `,
            action: {
                label: "Go to Reset Password",
                href: `${config.FRONTEND_URL}/reset-password`,
                tone: "danger",
            },
        });
    },
};
