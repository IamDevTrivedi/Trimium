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

const C = {
    pageBg: "#f4f5fa",
    cardBg: "#ffffff",
    border: "#e2e4ec",
    text: "#12131a",
    muted: "#6b6f7e",
    primary: "#7144e6",
    primarySoft: "#efeafd",
    primarySoftText: "#5a41cc",
    accent: "#3ecba8",
    accentSoft: "#e0faf2",
    danger: "#d33636",
    dangerSoft: "#fbe8e8",
    dangerSoftText: "#b32a2a",
    dark: {
        pageBg: "#0f1016",
        cardBg: "#181a22",
        border: "#2d2f3d",
        text: "#edf0f7",
        muted: "#9397a8",
        primary: "#8b6ef0",
        primarySoft: "#221a4a",
        primarySoftText: "#b8a3ff",
        accent: "#3ecba8",
        accentSoft: "#143d32",
        danger: "#ef6b6b",
        dangerSoft: "#3d1c1c",
        dangerSoftText: "#fca5a5",
    },
} as const;

const D = C.dark;

const FONT_STACK =
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO_FONT_STACK =
    "'JetBrains Mono', 'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

const darkCss = `
@media (prefers-color-scheme: dark) {
    .tb-page { background-color: ${D.pageBg} !important; }
    .tb-card { background-color: ${D.cardBg} !important; border-color: ${D.border} !important; }
    .tb-text { color: ${D.text} !important; }
    .tb-muted { color: ${D.muted} !important; }
    .tb-border { border-color: ${D.border} !important; }
    .tb-primary-soft { background-color: ${D.primarySoft} !important; border-color: ${D.border} !important; }
    .tb-primary-soft-text { color: ${D.primarySoftText} !important; }
    .tb-danger-soft { background-color: ${D.dangerSoft} !important; border-color: ${D.border} !important; }
    .tb-danger-soft-text { color: ${D.dangerSoftText} !important; }
    .tb-accent-soft { background-color: ${D.accentSoft} !important; border-color: ${D.border} !important; }
    .tb-detail-bg { background-color: ${D.cardBg} !important; }
    .tb-header { color: ${D.muted} !important; }
    .tb-footer { color: ${D.muted} !important; }
    .tb-footer-link { color: ${D.primary} !important; }
}
`;

const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

const normalizeValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "Unknown";
    const normalized = String(value).trim();
    return normalized.length === 0 ? "Unknown" : normalized;
};

const safeText = (value: string | number | null | undefined): string => {
    return escapeHtml(normalizeValue(value));
};

const withVersion = (name: string, version: string): string => {
    const normalizedName = normalizeValue(name);
    const normalizedVersion = normalizeValue(version);
    if (normalizedVersion.toLowerCase() === "unknown") return normalizedName;
    return `${normalizedName} ${normalizedVersion}`.trim();
};

const actionButton = (action: EmailAction): string => {
    const isDanger = action.tone === "danger";
    const bg = isDanger ? C.danger : C.primary;

    return `
        <a href="${escapeHtml(action.href)}"
            class="tb-action-btn"
            style="display:inline-block;margin-top:20px;padding:13px 26px;background:${bg};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;line-height:1;text-align:center;">
            ${escapeHtml(action.label)}
        </a>
    `;
};

const otpCard = (OTP: string): string => {
    return `
        <div class="tb-primary-soft" style="margin:20px 0;padding:20px;border:1px solid ${C.border};background:${C.primarySoft};border-radius:12px;text-align:center;">
            <p class="tb-primary-soft-text" style="margin:0;color:${C.primarySoftText};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Verification Code</p>
            <p class="tb-otp" style="margin:12px 0 8px;color:${C.primary};font-family:${MONO_FONT_STACK};font-size:34px;font-weight:700;letter-spacing:10px;line-height:1.1;">${safeText(OTP)}</p>
            <p class="tb-muted" style="margin:0;color:${C.muted};font-size:12px;line-height:18px;">This code expires in 5 minutes.</p>
        </div>
    `;
};

const detailsTable = (
    title: string,
    rows: Array<{ label: string; value: string | number | null | undefined }>
): string => {
    const detailsRows = rows
        .map((row, idx) => {
            const isEven = idx % 2 === 0;
            return `
                <tr>
                    <td class="tb-muted" style="padding:7px 10px 7px 0;color:${C.muted};font-size:12px;line-height:18px;width:120px;vertical-align:top;${isEven ? "" : ""}">${escapeHtml(row.label)}</td>
                    <td class="tb-text" style="padding:7px 0;color:${C.text};font-size:12px;line-height:18px;font-weight:500;vertical-align:top;">${safeText(row.value)}</td>
                </tr>
            `;
        })
        .join("");

    return `
        <div class="tb-detail-bg" style="margin:20px 0 0;padding:16px;border:1px solid ${C.border};background:${C.cardBg};border-radius:12px;">
            <p class="tb-text" style="margin:0 0 10px;color:${C.text};font-size:13px;font-weight:600;line-height:20px;">${escapeHtml(title)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                ${detailsRows}
            </table>
        </div>
    `;
};

const bulletList = (items: string[]): string => {
    const content = items
        .map((item) => `<li style="margin:0 0 6px 0;">${escapeHtml(item)}</li>`)
        .join("");

    return `
        <ul style="margin:10px 0 0 16px;padding:0;color:${C.text};font-size:13px;line-height:20px;">
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
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <style>
        ${darkCss}
        @media only screen and (max-width: 480px) {
            .tb-card { padding: 0 !important; }
            .tb-card-inner { padding: 20px !important; }
            .tb-otp { font-size: 26px !important; letter-spacing: 7px !important; }
            .tb-action-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
            .tb-detail-label { display: block !important; width: 100% !important; padding-bottom: 0 !important; }
            .tb-detail-value { display: block !important; width: 100% !important; padding-top: 2px !important; }
            .tb-title { font-size: 20px !important; line-height: 26px !important; }
            .tb-footer-content { padding: 8px 4px 0 !important; }
        }
        @media only screen and (max-width: 360px) {
            .tb-otp { font-size: 22px !important; letter-spacing: 5px !important; }
            .tb-title { font-size: 18px !important; line-height: 24px !important; }
        }
    </style>
</head>
    <body class="tb-page" style="margin:0;padding:0;background:${C.pageBg};font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:${C.pageBg};">
            <tr>
                <td align="center" style="padding:32px 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;border-collapse:collapse;">
                        <tr>
                            <td class="tb-header" style="padding:0 0 16px 4px;color:${C.muted};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Trimium</td>
                        </tr>
                        <tr>
                            <td class="tb-card" style="background:${C.cardBg};border:1px solid ${C.border};border-radius:14px;overflow:hidden;">
                                <div style="height:5px;background:${C.primary};"></div>
                                <div class="tb-card-inner" style="padding:28px 28px 24px;">
                                    <div style="display:inline-block;margin:0 0 16px;padding:6px 12px;border-radius:999px;background:${C.primarySoft};">
                                        <span class="tb-primary-soft-text" style="color:${C.primarySoftText};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(badge)}</span>
                                    </div>
                                    <h1 class="tb-title tb-text" style="margin:0 0 10px;color:${C.text};font-size:22px;line-height:28px;font-weight:700;">${escapeHtml(title)}</h1>
                                    <p class="tb-muted" style="margin:0;color:${C.muted};font-size:14px;line-height:22px;">${escapeHtml(intro)}</p>
                                    ${content}
                                    ${action ? actionButton(action) : ""}
                                    ${
                                        outro
                                            ? `<p class="tb-muted" style="margin:20px 0 0;padding-top:16px;border-top:1px solid ${C.border};color:${C.muted};font-size:12px;line-height:18px;">${escapeHtml(outro)}</p>`
                                            : ""
                                    }
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="tb-footer" style="padding:16px 6px 0;text-align:center;color:${C.muted};font-size:12px;line-height:18px;">
                                <span class="tb-footer-content">
                                    Sent by <strong style="font-weight:600;">Trimium</strong> &middot; URL management &amp; analytics
                                </span>
                                <br/>
                                <a class="tb-footer-link" href="${escapeHtml(config.FRONTEND_URL)}" style="color:${C.primary};text-decoration:none;">Open Trimium</a>
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
                <p class="tb-muted" style="margin:0;color:${C.muted};font-size:13px;line-height:20px;">
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
                <p class="tb-muted" style="margin:16px 0 0;color:${C.muted};font-size:13px;line-height:20px;">
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
                <p class="tb-muted" style="margin:16px 0 0;color:${C.muted};font-size:13px;line-height:20px;">
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
                <div class="tb-primary-soft" style="margin:20px 0;padding:18px 20px;border:1px solid ${C.border};background:${C.primarySoft};border-radius:12px;">
                    <p class="tb-primary-soft-text" style="margin:0;color:${C.primarySoftText};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Workspace</p>
                    <p class="tb-text" style="margin:8px 0 0;color:${C.text};font-size:17px;line-height:24px;font-weight:700;">${safeText(workspaceTitle)}</p>
                    <p class="tb-muted" style="margin:6px 0 0;color:${C.muted};font-size:13px;line-height:20px;">${safeText(description)}</p>
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
                <p class="tb-muted" style="margin:16px 0 0;color:${C.muted};font-size:13px;line-height:20px;">
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
                <p class="tb-muted" style="margin:16px 0 0;color:${C.muted};font-size:13px;line-height:20px;">
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
                <div class="tb-danger-soft" style="margin:16px 0 0;padding:14px;border-radius:10px;border:1px solid ${C.dangerSoft};background:${C.dangerSoft};">
                    <p class="tb-danger-soft-text" style="margin:0;color:${C.dangerSoftText};font-size:13px;line-height:20px;">
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
                <p class="tb-muted" style="margin:16px 0 0;color:${C.muted};font-size:13px;line-height:20px;">
                    If this was you, wait for the cooldown and try again with the correct password.
                </p>
                <div class="tb-danger-soft" style="margin:14px 0 0;padding:14px;border-radius:10px;border:1px solid ${C.border};background:${C.dangerSoft};">
                    <p class="tb-danger-soft-text" style="margin:0;color:${C.dangerSoftText};font-size:13px;line-height:20px;font-weight:600;">
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
