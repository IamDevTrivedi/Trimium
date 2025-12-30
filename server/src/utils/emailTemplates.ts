import { LocationData } from "@/middlewares/location";
import { readableDate, readableTime } from "./date";
import { ParsedUA } from "@/middlewares/UAParser";
import { config } from "@config/env";

export const emailTemplates = {
    sendOTPForCreateAccount: ({ OTP }: { OTP: string }) => {
        return `
        <div>
            <h2>Account Verification</h2>
            <p>Your account verification code is: <strong>${OTP}</strong></p>
            <p>This code is valid for 5 minutes.</p>
        </div>
        `;
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
        return `
        <div>
            <h2>Password Reset Request</h2>
            <p>Your password reset code is: <strong>${OTP}</strong></p>
            <p>This code is valid for 5 minutes.</p>
            <h3>Request Details:</h3>
            <ul>
                <li><strong>Browser:</strong> ${UAinfo.browser.name} ${UAinfo.browser.version !== "unknown" ? UAinfo.browser.version : ""}</li>
                <li><strong>Operating System:</strong> ${UAinfo.os.name} ${UAinfo.os.version !== "unknown" ? UAinfo.os.version : ""}</li>
                <li><strong>Device:</strong> ${UAinfo.device.type}</li>
                <li><strong>Location:</strong> ${locationData.displayName}</li>
                <li><strong>Coordinates:</strong> ${locationData.lat}, ${locationData.lon}</li>
                <li><strong>IP Address:</strong> ${IPAddress}</li>
                <li><strong>Time:</strong> ${readableDate()} at ${readableTime()}</li>
            </ul>
            <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        `;
    },

    loginAlert: ({
        UAinfo,
        locationData,
        IPAddress,
    }: {
        UAinfo: ParsedUA;
        locationData: LocationData;
        IPAddress: string;
    }) => {
        return `
        <div>
            <h2>New Login Detected</h2>
            <p>We noticed a new login to your account with the following details:</p>
            <h3>Login Details:</h3>
            <ul>
                <li><strong>Browser:</strong> ${UAinfo.browser.name} ${UAinfo.browser.version !== "unknown" ? UAinfo.browser.version : ""}</li>
                <li><strong>Operating System:</strong> ${UAinfo.os.name} ${UAinfo.os.version !== "unknown" ? UAinfo.os.version : ""}</li>
                <li><strong>Device:</strong> ${UAinfo.device.type}</li>
                <li><strong>Location:</strong> ${locationData.displayName}</li>
                <li><strong>Coordinates:</strong> ${locationData.lat}, ${locationData.lon}</li>
                <li><strong>IP Address:</strong> ${IPAddress}</li>
                <li><strong>Time:</strong> ${readableDate()} at ${readableTime()}</li>
            </ul>
            <p>If this was you, no further action is needed. If you do not recognize this activity, please secure your account immediately.</p>
        </div>
        `;
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
        return `
        <div>
            <h2>Workspace Invitation</h2>
            <p>You have been invited to join the workspace: <strong>${workspaceTitle}</strong></p>
            <h3>Invitation Details:</h3>
            <ul>
                <li><strong>Description:</strong> ${description}</li>
                <li><strong>Permission Level:</strong> ${permission.charAt(0).toUpperCase() + permission.slice(1)}</li>
                <li><strong>Invited by:</strong> ${senderName}</li>
            </ul>
            <p>To accept the invitation and join the workspace, please click the link below:</p>
            <p><a href="${config.FRONTEND_URL}/w?tab=pending">Join Workspace</a></p>
            <p>If you do not have an account, you will be prompted to create one after clicking the link.</p>
        </div>
        `;
    },
};
