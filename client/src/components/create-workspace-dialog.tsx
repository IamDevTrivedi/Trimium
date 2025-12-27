"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function CreateWorkspaceDialog() {
    return (
        <Dialog>
            <DialogTrigger>
                <Button size="sm" className="h-9 gap-2 px-4 text-xs font-medium">
                    <Plus className="h-4 w-4" />
                    New Workspace
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Give your new workspace a name and description to get started.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label
                            htmlFor="name"
                            className="text-xs uppercase tracking-wider text-muted-foreground"
                        >
                            Workspace Name
                        </Label>
                        <Input id="name" placeholder="e.g. Acme Production" className="h-10" />
                    </div>
                    <div className="grid gap-2">
                        <Label
                            htmlFor="description"
                            className="text-xs uppercase tracking-wider text-muted-foreground"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="What is this workspace for?"
                            className="min-h-[100px] resize-none"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" className="w-full">
                        Create Workspace
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
