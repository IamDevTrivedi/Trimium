import crypto from "crypto";

export const generateOTP = (): string => {
    const otp = crypto.randomInt(0, 1000000);
    return otp.toString().padStart(6, "0");
};
