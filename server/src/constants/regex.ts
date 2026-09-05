export const EMAIL = /^(?!.*\s)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const NAME = /^(?!.*\s)[A-Za-z]+$/;
export const USERNAME = /^(?!.*\s)[A-Za-z0-9._]+$/;
export const PASSWORD = /^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#^()_+=-]).{8,128}$/;
export const OTP = /^(?!.*\s)[2-9A-HJ-NP-Z]{8}$/;
export const SHORTCODE = /^[A-Za-z0-9_-]{5,20}$/;
export const UTC_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
export const TAGS = /^(?=.{1,32}$)(?!-)(?!.*--)[a-z0-9]+(?:-[a-z0-9]+)*$/;
