"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCreateAccountStore } from "@/store/create-account-store";
import { Toast } from "./toast";
import { InputOTPGroup, InputOTPSeparator, InputOTPSlot, InputOTP } from "./ui/input-otp";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import React from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { NAME, PASSWORD, USERNAME } from "@/constants/regex";
import { backend } from "@/config/backend";
import { useRouter } from "next/navigation";
import { toastError } from "@/lib/toast-error";
import { handleResponse } from "@/lib/handle-response";
import { useUserStore } from "@/store/user-store";

export function CreateAccountEmail() {
    const { setEmail, reset } = useCreateAccountStore();
    const { user } = useUserStore();

    const router = useRouter();

    const schema = z.object({
        email: z
            .string()
            .min(1, { message: "Email address is required." })
            .email({ message: "Please enter a valid email address." }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
    });

    const onSubmit = async (data: z.infer<typeof schema>) => {
        try {
            setEmail(data.email);
            const { data: resData } = await backend.post(
                "/api/v1/auth/send-otp-for-create-account",
                {
                    email: data.email,
                }
            );
            if (handleResponse(resData)) {
                router.replace("/create-account/verify");
            }
            return;
        } catch (error: unknown) {
            toastError(error);
        }
    };

    React.useEffect(() => {
        if (user) {
            Toast.info("You are already logged in.");
            router.replace("/");
        }
    }, [user, router]);

    React.useEffect(() => {
        reset();
    }, [reset]);

    if (user) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={
                            errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                        }
                        {...register("email")}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="text-sm text-destructive">
                            {errors.email.message}
                        </p>
                    )}
                    <FieldDescription>
                        We&apos;ll send a 6-digit verification code to this email.
                    </FieldDescription>
                </Field>
            </FieldGroup>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                loading={isSubmitting}
            >
                Continue with Email
            </Button>
        </form>
    );
}

export function CreateAccountVerify() {
    const { OTP, setOTP, email } = useCreateAccountStore();
    const [resentIn, setResentIn] = React.useState(60);
    const [wrong, setWrong] = React.useState(0);
    const [loadingResend, setLoadingResend] = React.useState(false);

    const router = useRouter();

    React.useEffect(() => {
        if (email === "") {
            router.replace("/create-account");
            router.refresh();
        }
    }, [email, router]);

    React.useEffect(() => {
        if (resentIn <= 0) return;

        const timer = setInterval(() => {
            setResentIn((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resentIn]);

    React.useEffect(() => {
        if (wrong >= 3) {
            router.replace("/create-account");
        }
    }, [wrong]);

    const handleResendOTP = async () => {
        try {
            setLoadingResend(true);
            const { data: resData } = await backend.post(
                "/api/v1/auth/send-otp-for-create-account",
                {
                    email: email,
                }
            );

            if (!resData || !resData.success) {
                Toast.error(resData?.message || "Failed to resend verification code.", {
                    description: "Please try again.",
                });
                return;
            }

            Toast.success("Verification code resent to your email.", {
                description: "Please check your inbox.",
            });
        } catch (error: unknown) {
            toastError(error);
        } finally {
            setOTP("");
            setLoadingResend(false);
            setResentIn(60);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOTP(OTP);

        try {
            const { data: resData } = await backend.post(
                "/api/v1/auth/verify-otp-for-create-account",
                {
                    email: email,
                    OTP: OTP,
                }
            );

            if (handleResponse(resData)) {
                router.replace("/create-account/set-profile");
            }
            return;
        } catch (error: unknown) {
            toastError(error);
            setWrong((prev) => prev + 1);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                    <div className="flex justify-center">
                        <InputOTP
                            id="otp"
                            pattern={REGEXP_ONLY_DIGITS}
                            maxLength={6}
                            value={OTP}
                            onChange={setOTP}
                            required
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <FieldDescription>
                        Enter the 6-digit code we sent to your email address.
                    </FieldDescription>
                </Field>
            </FieldGroup>

            <div className="space-y-4">
                <Button type="submit" className="w-full" size="lg">
                    Verify Account
                </Button>
                <FieldDescription className="text-center">
                    Didn&apos;t receive the code?{" "}
                    <Button
                        type="button"
                        variant="link"
                        disabled={resentIn > 0 || loadingResend}
                        size="sm"
                        className="h-auto p-0"
                        onClick={handleResendOTP}
                    >
                        {resentIn > 0 ? `Resend in ${resentIn}s` : "Resend Code"}
                    </Button>
                </FieldDescription>
            </div>
        </form>
    );
}

export function CreateAccountProfile() {
    type availabilityStatus = "available" | "unavailable" | "checking" | null;

    const router = useRouter();

    const { email, OTP, setFirstName, setLastName, setUsername } = useCreateAccountStore();

    const [usernameStatus, setUsernameStatus] = React.useState<availabilityStatus>(null);
    const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const schema = z.object({
        firstName: z.string().min(1, { message: "First name is required." }).regex(NAME, {
            message: "First name contains invalid characters.",
        }),
        lastName: z.string().min(1, { message: "Last name is required." }).regex(NAME, {
            message: "Last name contains invalid characters.",
        }),
        username: z
            .string()
            .min(1, { message: "Username must be at least 1 character." })
            .regex(USERNAME, {
                message: "Username can only contain letters, numbers, underscores, and periods.",
            }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        clearErrors,
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
    });

    React.useEffect(() => {
        if (email === "" || OTP === "") {
            router.replace("/create-account");
            router.refresh();
        }
    }, [email, OTP, router]);

    React.useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const checkUsernameAvailability = async (usernameToCheck: string) => {
        if (USERNAME.test(usernameToCheck) === false) {
            setUsernameStatus(null);
            return;
        }

        try {
            setUsernameStatus("checking");

            const { data: resData } = await backend.post("/api/v1/auth/check-username", {
                usernameToCheck: usernameToCheck,
            });

            if (!resData || !resData.success) {
                setUsernameStatus("unavailable");
                return;
            }

            if (resData.available) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("unavailable");
            }
        } catch (error) {
            toastError(error);
            setUsernameStatus(null);
        }
    };

    const debouncedUsernameCheck = (username: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        setUsernameStatus(null);
        debounceTimerRef.current = setTimeout(() => {
            checkUsernameAvailability(username);
        }, 500);
    };

    const onSubmit = async (data: z.infer<typeof schema>) => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (usernameStatus !== "available") {
            Toast.error("Please choose an available username before proceeding.");
            return;
        }

        try {
            setFirstName(data.firstName);
            setLastName(data.lastName);
            setUsername(data.username);
            router.replace("/create-account/set-password");
        } catch (error: unknown) {
            toastError(error);
        }
    };

    if (email === "" || OTP === "") {
        return null;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className={`${errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register("firstName")}
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    />
                    {errors.firstName && (
                        <p id="firstName-error" className="text-sm text-destructive">
                            {errors.firstName.message}
                        </p>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className={`${errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register("lastName")}
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    />
                    {errors.lastName && (
                        <p id="lastName-error" className="text-sm text-destructive">
                            {errors.lastName.message}
                        </p>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        className={`${errors.username ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register("username")}
                        aria-invalid={!!errors.username}
                        aria-describedby={errors.username ? "username-error" : undefined}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (errors.username) {
                                clearErrors("username");
                            }
                            debouncedUsernameCheck(value);
                        }}
                    />
                    {errors.username && (
                        <p id="username-error" className="text-sm text-destructive">
                            {errors.username.message}
                        </p>
                    )}
                    {!errors.username && usernameStatus === "available" && (
                        <p className="text-sm text-green-500">Username is available.</p>
                    )}
                    {!errors.username && usernameStatus === "unavailable" && (
                        <p className="text-sm text-destructive">Username is already taken.</p>
                    )}
                    {!errors.username && usernameStatus === "checking" && (
                        <p className="text-sm text-yellow-500">Checking username availability...</p>
                    )}
                    <FieldDescription>Choose a unique username for your account.</FieldDescription>
                </Field>
            </FieldGroup>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                loading={isSubmitting}
            >
                Set Profile
            </Button>
        </form>
    );
}

export function CreateAccountPassword() {
    const { setPassword, setConfirmPassword, email, OTP, username, firstName, lastName, reset } =
        useCreateAccountStore();

    const router = useRouter();

    React.useEffect(() => {
        if (email === "" || OTP === "" || username === "" || firstName === "" || lastName === "") {
            router.replace("/create-account");
            router.refresh();
        }
    }, [email, OTP, username, firstName, lastName, router]);

    const schema = z
        .object({
            password: z.string().regex(PASSWORD, {
                message:
                    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
            }),
            confirmPassword: z.string().min(1, {
                message: "Please confirm your password.",
            }),
        })
        .superRefine(({ password, confirmPassword }, ctx) => {
            if (password !== confirmPassword) {
                ctx.addIssue({
                    path: ["confirmPassword"],
                    message: "Passwords do not match.",
                    code: z.ZodIssueCode.custom,
                });
            }
        });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
    });

    const onSubmit = async (data: z.infer<typeof schema>) => {
        try {
            setPassword(data.password);
            setConfirmPassword(data.confirmPassword);

            const { data: resData } = await backend.post("/api/v1/auth/create-account", {
                email,
                firstName,
                lastName,
                username,
                password: data.password,
            });

            if (handleResponse(resData)) {
                router.replace("/login");
                router.refresh();
            }
            console.log("eeee");
        } catch (error: unknown) {
            toastError(error);
        }
    };

    if (email === "" || OTP === "" || username === "" || firstName === "" || lastName === "") {
        return null;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className={`${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                        <p id="password-error" className="text-sm text-destructive">
                            {errors.password.message}
                        </p>
                    )}
                </Field>

                <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        className={`${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        {...register("confirmPassword")}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={
                            errors.confirmPassword ? "confirmPassword-error" : undefined
                        }
                    />
                    {errors.confirmPassword && (
                        <p id="confirmPassword-error" className="text-sm text-destructive">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </Field>
            </FieldGroup>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                loading={isSubmitting}
            >
                Create Account
            </Button>
        </form>
    );
}
