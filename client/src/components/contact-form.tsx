"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { backend } from "@/config/backend";
import { toastError } from "@/lib/toast-error";
import { handleResponse } from "@/lib/handle-response";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const contactFormSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: "First name must be at least 2 characters." })
        .max(50, { message: "First name must be less than 50 characters." }),
    lastName: z
        .string()
        .min(2, { message: "Last name must be at least 2 characters." })
        .max(50, { message: "Last name must be less than 50 characters." }),
    email: z
        .string()
        .min(1, { message: "Email address is required." })
        .email({ message: "Please enter a valid email address." }),
    subject: z
        .string()
        .min(2, { message: "Subject must be at least 2 characters." })
        .max(100, { message: "Subject must be less than 100 characters." }),
    description: z
        .string()
        .min(5, { message: "Message must be at least 5 characters." })
        .max(2000, { message: "Message must be less than 2000 characters." }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const subjectOptions = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "sales", label: "Sales & Pricing" },
    { value: "partnership", label: "Partnership Opportunity" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "bug", label: "Bug Report" },
    { value: "other", label: "Other" },
];

export function ContactForm() {
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        mode: "onSubmit",
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            subject: "",
            description: "",
        },
    });

    const subjectValue = watch("subject");

    const onSubmit = async (data: ContactFormData) => {
        try {
            const { data: resData } = await backend.post("/api/v1/contact/submit", {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                subject: data.subject,
                description: data.description,
            });

            if (handleResponse(resData)) {
                setIsSubmitted(true);
                reset();
            }
        } catch (error: unknown) {
            toastError(error);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">
                    Message Sent Successfully!
                </h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                    Thank you for reaching out. We&apos;ve received your message and will get back
                    to you within 24-48 hours.
                </p>
                <Button variant="outline" onClick={() => setIsSubmitted(false)} className="mt-4">
                    Send Another Message
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
                {/* Name Fields - Side by Side */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            className={
                                errors.firstName
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }
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
                            className={
                                errors.lastName
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }
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
                </div>

                {/* Email Field */}
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
                        We&apos;ll send a confirmation to this email address.
                    </FieldDescription>
                </Field>

                {/* Subject Field */}
                <Field>
                    <FieldLabel htmlFor="subject">Subject</FieldLabel>
                    <Select
                        value={subjectValue}
                        onValueChange={(value) => setValue("subject", value ?? "")}
                    >
                        <SelectTrigger
                            id="subject"
                            className={`w-full ${
                                errors.subject
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }`}
                            aria-invalid={!!errors.subject}
                        >
                            <SelectValue>
                                {subjectValue || (
                                    <span className="text-muted-foreground">Select a subject</span>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {subjectOptions.map((option) => (
                                <SelectItem key={option.value} value={option.label}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.subject && (
                        <p id="subject-error" className="text-sm text-destructive">
                            {errors.subject.message}
                        </p>
                    )}
                </Field>

                {/* Message Field */}
                <Field>
                    <FieldLabel htmlFor="description">Message</FieldLabel>
                    <Textarea
                        id="description"
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        className={
                            errors.description
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                        }
                        {...register("description")}
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? "description-error" : undefined}
                    />
                    {errors.description && (
                        <p id="description-error" className="text-sm text-destructive">
                            {errors.description.message}
                        </p>
                    )}
                    <FieldDescription>
                        Please provide as much detail as possible so we can assist you better.
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
                <Send className="mr-2 h-4 w-4" />
                Send Message
            </Button>
        </form>
    );
}
