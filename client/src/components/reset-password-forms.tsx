"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { InputOTPGroup, InputOTPSeparator, InputOTPSlot, InputOTP } from "./ui/input-otp";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import React from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { NAME, PASSWORD, USERNAME } from "@/constants/regex";
import { useResetPasswordStore } from "@/store/reset-password-store";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { useRouter } from "next/navigation";
import { toastError } from "@/lib/toast-error";
import { useUserStore } from "@/store/user-store";
import { Toast } from "./toast";

export function ResetPasswordEmail() {
    const { setIdentity, reset } = useResetPasswordStore();
    const { user } = useUserStore();

    const router = useRouter();

    const schema = z.object({
        identity: z
            .string()
            .refine((val) => USERNAME.test(val) || z.email().safeParse(val).success, {
                message: "Please enter a valid email address or username.",
            }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
    });

    React.useEffect(() => {
        reset();
    }, [reset]);

    React.useEffect(() => {
        if (user) {
            Toast.info("You are already logged in.");
            router.replace("/");
        }
    }, [user, router]);

    const onSubmit = async (data: z.infer<typeof schema>) => {
        try {
            setIdentity(data.identity);

            const { data: resData } = await backend.post("/api/v1/auth/reset-password/send-otp", {
                identity: data.identity,
            });

            if (handleResponse(resData)) {
                router.replace("/reset-password/verify");
            }
        } catch (error: unknown) {
            toastError(error);
        }
    };

    if (user) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="email">Email Address or Username</FieldLabel>
                    <Input
                        id="identity"
                        type="text"
                        placeholder="Your registered email or username"
                        className={
                            errors.identity
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                        }
                        {...register("identity")}
                        aria-invalid={!!errors.identity}
                        aria-describedby={errors.identity ? "identity-error" : undefined}
                    />
                    {errors.identity && (
                        <p id="identity-error" className="text-sm text-destructive">
                            {errors.identity.message}
                        </p>
                    )}
                    <FieldDescription>
                        We&apos;ll send a 6-digit Verification Code to registered email.
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
                Send Verification Code
            </Button>
        </form>
    );
}

export function ResetPasswordVerify() {
    const { setOTP, OTP, identity } = useResetPasswordStore();
    const [resentIn, setResentIn] = React.useState(60);
    const [loadingResend, setLoadingResend] = React.useState(false);
    const [wrong, setWrong] = React.useState(0);

    const router = useRouter();

    React.useEffect(() => {
        if (resentIn <= 0) return;

        const timer = setInterval(() => {
            setResentIn((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resentIn]);

    React.useEffect(() => {
        if (wrong >= 3) {
            router.replace("/reset-password");
        }
    }, [wrong, router]);

    React.useEffect(() => {
        if (identity === "") {
            router.replace("/reset-password");
        }
    }, [identity, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setOTP(OTP);

            const { data: resData } = await backend.post("/api/v1/auth/reset-password/verify-otp", {
                identity,
                OTP,
            });

            if (handleResponse(resData)) {
                router.replace("/reset-password/set-password");
            } else {
                setWrong((prev) => prev + 1);
            }
        } catch (error) {
            setWrong((prev) => prev + 1);
            toastError(error);
        }
    };

    const handleResendCode = async () => {
        try {
            setLoadingResend(true);
            const { data: resData } = await backend.post("/api/v1/auth/reset-password/send-otp", {
                identity: identity,
            });
            handleResponse(resData);
        } catch (error) {
            toastError(error);
        } finally {
            setResentIn(60);
            setOTP("");
            setLoadingResend(false);
        }
    };

    if (identity === "") {
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
                    Verify it's You
                </Button>
                <FieldDescription className="text-center">
                    Didn&apos;t receive the code?{" "}
                    <Button
                        type="button"
                        variant="link"
                        disabled={resentIn > 0 || loadingResend}
                        size="sm"
                        className="h-auto p-0"
                        onClick={handleResendCode}
                    >
                        {resentIn > 0 ? `Resend in ${resentIn}s` : "Resend Code"}
                    </Button>
                </FieldDescription>
            </div>
        </form>
    );
}

export function ResetPasswordPassword() {
    const { setPassword, setConfirmPassword, identity, OTP } = useResetPasswordStore();

    const router = useRouter();

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

            const { data: resData } = await backend.post(
                "/api/v1/auth/reset-password/set-new-password",
                {
                    identity,
                    password: data.password,
                }
            );

            if (handleResponse(resData)) {
                router.replace("/login");
            }
        } catch (error: unknown) {
            toastError(error);
        }
    };

    React.useEffect(() => {
        if (identity === "" || OTP === "") {
            router.replace("/reset-password");
        }
    }, [identity, OTP, router]);

    if (identity === "" || OTP === "") {
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
                Set New Password
            </Button>
        </form>
    );
}
