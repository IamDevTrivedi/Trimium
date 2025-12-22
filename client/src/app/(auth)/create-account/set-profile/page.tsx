import { IAgree } from "@/components/card-footer";
import { CreateAccountProfile } from "@/components/create-account-forms";
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
                            Complete Your Profile
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Please provide the following information to set up your account.
                        </CardDescription>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <CreateAccountProfile />
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
