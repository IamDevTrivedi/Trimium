import { IAgree } from "@/components/card-footer";
import { CreateAccountEmail } from "@/components/create-account-forms";
import { LoginFormEmail } from "@/components/login-forms";
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
                            Welcome Back !
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Login to your account to continue
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <LoginFormEmail />
                    <div className="mt-6">
                        <Separator className="my-4" />
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">Don't have an account?</p>
                            <Button variant="outline" className="w-full h-10">
                                <Link href="/create-account">Create a New Account</Link>
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
