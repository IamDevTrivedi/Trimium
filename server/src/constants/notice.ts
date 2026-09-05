// Validation error messages — paired with their corresponding regex in ./regex.ts.

export const EMAIL_NOTICE = "Email must be a valid email address and must not contain spaces.";
export const NAME_NOTICE = "Name must contain only letters and must not contain spaces.";
export const USERNAME_NOTICE =
    "Username can contain letters, numbers, dots, and underscores, and must not contain spaces.";
export const PASSWORD_NOTICE =
    "Password must be 8-128 characters long, include uppercase and lowercase letters, a number, a special character, and must not contain spaces.";
export const OTP_NOTICE = "OTP must be exactly 8 characters and must not contain spaces.";
export const SHORTCODE_NOTICE =
    "Shortcode must be 5-20 characters long, can include letters, numbers, underscores, hyphens, and must not contain spaces.";
export const UTC_DATE_NOTICE =
    "Date must be in valid UTC format (e.g., 2023-01-01T12:00:00Z) and must not contain spaces.";
export const TAGS_NOTICE =
    "Tags must be 1-32 characters long, can include lowercase letters, numbers, hyphens (not at start/end or consecutively), and must not contain spaces.";
