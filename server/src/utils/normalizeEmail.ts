export const normalizeEmail = (email: string) => {
    const [local, domain] = email.toLowerCase().split("@");
    const baseLocal = local.split("+")[0];
    return `${baseLocal}@${domain}`;
};
