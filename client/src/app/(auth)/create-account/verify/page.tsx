import { IAgree } from "@/components/card-footer";
import { CreateAccountVerify } from "@/components/create-account-forms";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader className="space-y-3 text-center">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Verify Your Email Address
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                            We have sent a verification code to your email.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <CreateAccountVerify />
                    <div>
                        <Separator className={"my-4"} />
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">Edit Email Address?</p>
                            <Button variant="outline" className="w-full h-10">
                                <Link
                                    href="/create-account"
                                    className="flex items-center justify-center"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back to Email Entry
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
