import { readableDate, readableTime } from "./date";

export const emailTemplates = {
    sendOTPForCreateAccount: ({ OTP }: { OTP: string }) => {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>n
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; border: 2px solid #000000;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; background-color: #000000; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Account Verification</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px; background-color: #ffffff;">
                                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #000000;">
                                        Your verification code:
                                    </p>
                                    
                                    <!-- OTP Box -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                                        <tr>
                                            <td style="padding: 30px; background-color: #000000; text-align: center; border: 3px solid #000000;">
                                                <div style="font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                    ${OTP}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 0 0 20px; font-size: 14px; color: #000000;">
                                        Valid for 5 minutes
                                    </p>
                                    
                                    <p style="margin: 0; font-size: 14px; color: #666666;">
                                        ${readableDate()} at ${readableTime()}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 40px; background-color: #f5f5f5; border-top: 1px solid #000000;">
                                    <p style="margin: 0; font-size: 12px; color: #666666; text-align: center;">
                                        Automated notification
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
    },

    sendOTPForResetPassword: ({ OTP, UAinfo }: { OTP: string; UAinfo: UAParser.IResult }) => {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; border: 2px solid #000000;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; background-color: #000000; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Password Reset</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px; background-color: #ffffff;">
                                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #000000;">
                                        Your password reset code:
                                    </p>
                                    
                                    <!-- OTP Box -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                                        <tr>
                                            <td style="padding: 30px; background-color: #000000; text-align: center; border: 3px solid #000000;">
                                                <div style="font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                    ${OTP}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="margin: 0 0 30px; font-size: 14px; color: #000000;">
                                        Valid for 5 minutes
                                    </p>
                                    
                                    <!-- Request Details -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #000000; margin: 0 0 20px;">
                                        <tr>
                                            <td style="padding: 20px; background-color: #f5f5f5;">
                                                <p style="margin: 0 0 12px; font-size: 13px; color: #000000; font-weight: 600;">
                                                    Request Details
                                                </p>
                                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                                    <tr>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #666666; width: 100px;">Browser</td>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #000000;">${UAinfo.browser?.name || "unknown"} ${UAinfo.browser?.version || ""}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #666666;">OS</td>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #000000;">${UAinfo.os?.name || "unknown"} ${UAinfo.os?.version || ""}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #666666;">Time</td>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #000000;">${readableDate()} at ${readableTime()}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 40px; background-color: #f5f5f5; border-top: 1px solid #000000;">
                                    <p style="margin: 0; font-size: 12px; color: #666666; text-align: center;">
                                        Automated notification
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
    },

    loginAlert: ({ UAinfo }: { UAinfo: UAParser.IResult }) => {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; border: 2px solid #000000;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; background-color: #000000; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">New Login Detected</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px; background-color: #ffffff;">
                                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #000000;">
                                        A new login to your account was detected.
                                    </p>
                                    
                                    <!-- Login Details -->
                                    <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #000000;">
                                        <tr>
                                            <td style="padding: 20px; background-color: #f5f5f5;">
                                                <p style="margin: 0 0 12px; font-size: 13px; color: #000000; font-weight: 600;">
                                                    Login Details
                                                </p>
                                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                                    <tr>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #666666; width: 100px;">Browser</td>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #000000;">${UAinfo.browser?.name || "unknown"} ${UAinfo.browser?.version || ""}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #666666;">OS</td>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #000000;">${UAinfo.os?.name || "unknown"} ${UAinfo.os?.version || ""}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #666666;">Device</td>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #000000;">${UAinfo.device?.type || "Desktop"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #666666;">Time</td>
                                                        <td style="padding: 4px 0; font-size: 13px; color: #000000;">${readableDate()} at ${readableTime()}</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 40px; background-color: #f5f5f5; border-top: 1px solid #000000;">
                                    <p style="margin: 0; font-size: 12px; color: #666666; text-align: center;">
                                        Automated notification
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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
