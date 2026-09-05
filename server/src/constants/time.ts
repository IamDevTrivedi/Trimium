// time.ts exports constants related to time durations.
// All durations are exported in both milliseconds and seconds, named by their value
// (e.g. FIVE_MINUTES_IN_MS / FIVE_MINUTES_IN_S) and used as the context demands.
// Pick the unit that matches the API you are calling (e.g. Redis TTL wants seconds,
// cookie maxAge wants milliseconds, JWT expiresIn wants a duration string).

// ---------- One minute ----------
export const ONE_MINUTE_IN_MS = 60 * 1000;
export const ONE_MINUTE_IN_S = 60;

// ---------- Three minutes ----------
export const THREE_MINUTES_IN_S = 3 * 60;

// ---------- Five minutes ----------
export const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
export const FIVE_MINUTES_IN_S = 5 * 60;

// ---------- Fifteen minutes ----------
export const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
export const FIFTEEN_MINUTES_IN_S = 15 * 60;

// ---------- Thirty minutes ----------
export const THIRTY_MINUTES_IN_S = 30 * 60;

// ---------- Three seconds ----------
export const THREE_SECONDS_IN_MS = 3 * 1000;

// ---------- Thirty seconds ----------
export const THIRTY_SECONDS_IN_MS = 30 * 1000;

// ---------- One hour ----------
export const ONE_HOUR_IN_S = 60 * 60;

// ---------- Three hours ----------
export const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

// ---------- One day (24 hours) ----------
export const ONE_DAY_IN_S = 24 * 60 * 60;

// ---------- Seven days ----------
export const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

// ---------- JWT duration string (paired with SEVEN_DAYS_IN_MS — must always match) ----------
export const SEVEN_DAYS_JWT_STRING = "7d";

// ---------- One day (24 hours) in milliseconds, expressed directly for Redis cache TTLs ----------
export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
