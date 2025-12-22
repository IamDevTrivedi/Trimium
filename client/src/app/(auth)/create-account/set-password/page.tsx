import { IAgree } from "@/components/card-footer";
import { CreateAccountPassword } from "@/components/create-account-forms";
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
                            Set Strong Password
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Create a strong password to secure your new account.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <CreateAccountPassword />
                    <div className="mt-6">
                        <Separator className="my-4" />
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Entered wrong profile information?
                            </p>
                            <Button variant="outline" className="w-full h-10">
                                <Link
                                    href="/create-account/set-profile"
                                    className="flex items-center justify-center"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back to Profile setup
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
