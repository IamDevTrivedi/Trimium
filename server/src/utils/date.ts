/**
 * Converts a date to a readable long format
 * @param date - The date to format (defaults to current date)
 * @returns A string like "Monday, December 23, 2024"
 * @example
 * readableDate() // "Monday, December 23, 2024"
 * readableDate(new Date('2024-01-15')) // "Monday, January 15, 2024"
 */
export const readableDate = (date: Date = new Date()): string => {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

/**
 * Converts a date to a readable time format with timezone
 * @param date - The date to format (defaults to current date)
 * @returns A string like "3:45 PM EST"
 * @example
 * readableTime() // "3:45 PM EST"
 * readableTime(new Date('2024-01-15T15:30:00')) // "3:30 PM EST"
 */
export const readableTime = (date: Date = new Date()): string => {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
    });
};
