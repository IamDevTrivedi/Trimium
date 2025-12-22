"use client";

import { useLoginStore } from "@/store/login-store";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { PASSWORD, USERNAME } from "@/constants/regex";
import Link from "next/link";
import { toastError } from "@/lib/toast-error";
import { backend } from "@/config/backend";
import { handleResponse } from "@/lib/handle-response";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";

export function LoginFormEmail() {
    const { setEmail, setPassword } = useLoginStore();
    const { setUser } = useUserStore();

    const router = useRouter();

    const schema = z.object({
        identity: z
            .string()
            .refine((val) => USERNAME.test(val) || z.email().safeParse(val).success, {
                message: "Please enter a valid email address or username.",
            }),
        password: z.string().min(1, { message: "Password is required." }).regex(PASSWORD, {
            message:
                "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
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

    const onSubmit = async (data: z.infer<typeof schema>) => {
        try {
            setEmail(data.identity);
            setPassword(data.password);

            const { data: resData } = await backend.post("/api/v1/auth/login", {
                identity: data.identity,
                password: data.password,
            });

            if (handleResponse(resData)) {
                router.replace("/");
                setUser(resData.data);
            }
        } catch (error: unknown) {
            toastError(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="identity">Email Address or Username</FieldLabel>
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
                </Field>
            </FieldGroup>

            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Your secure password"
                        className={
                            errors.password
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                        }
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
            </FieldGroup>
            <div className="space-y-4">
                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                >
                    Login to my account
                </Button>
                <FieldDescription className="text-center">
                    Forgot your password?{" "}
                    <Link href={"/reset-password"}>
                        <Button type="button" variant="link" size="sm" className="h-auto p-0">
                            Reset Password
                        </Button>
                    </Link>
                </FieldDescription>
            </div>
        </form>
    );
}
