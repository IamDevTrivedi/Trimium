import crypto from "crypto";

const OTP_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const OTP_LENGTH = 8;

export const generateOTP = (): string => {
    const chars: string[] = new Array(OTP_LENGTH);
    for (let i = 0; i < OTP_LENGTH; i++) {
        chars[i] = OTP_ALPHABET[crypto.randomInt(0, OTP_ALPHABET.length)];
    }
    return chars.join("");
};
