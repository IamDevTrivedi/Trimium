import { IAgree } from "@/components/card-footer";
import { CreateAccountEmail } from "@/components/create-account-forms";
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
                            Create Your Account
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Join our platform to unlock all features and personalized experiences.
                            Get started with your email address.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <CreateAccountEmail />
                    <div className="mt-6">
                        <Separator className="my-4" />
                        <div className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?
                            </p>
                            <Button variant="outline" className="w-full h-10">
                                <Link href="/login">Sign In to Existing Account</Link>
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
