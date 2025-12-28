import { LocationData } from "@/middlewares/location";
import { readableDate, readableTime } from "./date";

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
        UAinfo: UAParser.IResult;
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
                <li><strong>Browser:</strong> ${UAinfo.browser?.name || "unknown"} ${UAinfo.browser?.version || ""}</li>
                <li><strong>Operating System:</strong> ${UAinfo.os?.name || "unknown"} ${UAinfo.os?.version || ""}</li>
                <li><strong>Device:</strong> ${UAinfo.device?.type || "Desktop"}</li>
                <li><strong>Location:</strong> ${locationData.displayName} </li>
                <li><strong>Coordinates:</strong> ${locationData.lat}, ${locationData.lon}</li>
                <li><strong>IP Address:</strong> ${IPAddress} </li>
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
        UAinfo: UAParser.IResult;
        locationData: LocationData;
        IPAddress: string;
    }) => {
        return `
        <div>
            <h2>New Login Detected</h2>
            <p>We noticed a new login to your account with the following details:</p>
            <ul>
                <li><strong>Browser:</strong> ${UAinfo.browser?.name || "unknown"} ${UAinfo.browser?.version || ""}</li>
                <li><strong>Operating System:</strong> ${UAinfo.os?.name || "unknown"} ${UAinfo.os?.version || ""}</li>
                <li><strong>Device:</strong> ${UAinfo.device?.type || "Desktop"}</li>
                <li><strong>Location:</strong> ${locationData.displayName} </li>
                <li><strong>Coordinates:</strong> ${locationData.lat}, ${locationData.lon}</li>
                <li><strong>IP Address:</strong> ${IPAddress} </li>
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
            <h2>You have been invited to join the workspace: ${workspaceTitle}</h2>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Permission Level:</strong> ${permission.charAt(0).toUpperCase() + permission.slice(1)}</p>
            <p><strong>Invited by:</strong> ${senderName}</p>
            <p>Please log in to your account to accept the invitation and access the workspace.</p>
        </div>
        `;
    },
};
