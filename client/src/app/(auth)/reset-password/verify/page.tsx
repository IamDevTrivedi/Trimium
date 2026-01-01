import { IAgree } from "@/components/card-footer";
import { ResetPasswordVerify } from "@/components/reset-password-forms";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Verify Identity",
    description:
        "Verify your identity to reset your Trimium password. Enter the verification code sent to your email.",
};

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader className="space-y-3 text-center">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Let's Verify It's You
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                            We have sent a verification code to registered email.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <ResetPasswordVerify />
                    <div>
                        <Separator className={"my-4"} />
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">Edit entered Identity ?</p>
                            <Button variant="outline" className="w-full h-10">
                                <Link
                                    href="/reset-password"
                                    className="flex items-center justify-center"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back to Identity Entry
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-6 pb-8">
                    <div className="w-full space-y-4">
                        <IAgree />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
