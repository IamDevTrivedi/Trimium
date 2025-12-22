import { IAgree } from "@/components/card-footer";
import { ResetPasswordEmail } from "@/components/reset-password-forms";
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
import Link from "next/link";

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader className="space-y-3 text-center">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Recover Your Account
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Enter your email or username below to recover your account
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <ResetPasswordEmail />
                    <div className="mt-6">
                        <Separator className="my-4" />
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Remember your account details?
                            </p>
                            <Button variant="outline" className="w-full h-10">
                                <Link href="/login">Sign In to Your Account</Link>
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
