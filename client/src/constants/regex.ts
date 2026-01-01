export const EMAIL = /^(?!.*\s)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const NAME = /^(?!.*\s)[A-Za-z]+$/;
export const USERNAME = /^(?!.*\s)[A-Za-z0-9._]+$/;
export const PASSWORD = /^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-]).{8,}$/;
export const OTP = /^(?!.*\s)\d{6}$/;
export const SHORTCODE = /^[A-Za-z0-9_-]{5,20}$/;
export const UTC_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
export const TAGS = /^(?=.{1,32}$)(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const EMAIL_NOTICE = "Email must be a valid email address and must not contain spaces.";
export const NAME_NOTICE = "Name must contain only letters and must not contain spaces.";
export const USERNAME_NOTICE =
    "Username can contain letters, numbers, dots, and underscores, and must not contain spaces.";
export const PASSWORD_NOTICE =
    "Password must be at least 8 characters long, include uppercase and lowercase letters, a number, a special character, and must not contain spaces.";
export const OTP_NOTICE = "OTP must be exactly 6 digits and must not contain spaces.";
export const SHORTCODE_NOTICE =
    "Shortcode must be 5-20 characters long, can include letters, numbers, underscores, hyphens, and must not contain spaces.";
export const UTC_DATE_NOTICE =
    "Date must be in valid UTC format (e.g., 2023-01-01T12:00:00Z) and must not contain spaces.";
export const TAGS_NOTICE =
    "Tags must be 1-32 characters long, can include lowercase letters, numbers, hyphens (not at start/end or consecutively), and must not contain spaces.";
