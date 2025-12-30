import { WorkspaceList } from "@/components/workspace-list";
import { PendingInvitations } from "@/components/pending-invitations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function WorkspacesPage() {
    return (
        <div className="flex min-h-screen flex-col max-w-5xl mx-auto my-12 px-4 py-8 bg-background text-foreground">
            <main className="flex-1 overflow-auto p-6">
                <Tabs defaultValue="all" className="w-full">
                    <div className="mb-6 flex flex-col md:flex-row gap-2 items-center justify-between">
                        <TabsList className="h-9 bg-muted/50 p-1">
                            <TabsTrigger value="all" className="px-4 text-xs font-medium">
                                My Workspaces
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="px-4 text-xs font-medium">
                                Pending Invitations
                            </TabsTrigger>
                        </TabsList>

                        <Button variant="default">
                            <Link href="/w/new" className="flex items-center">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Workspace
                            </Link>
                        </Button>
                    </div>

                    <TabsContent value="all" className="mt-0 outline-none">
                        <Suspense fallback={null}>
                            <WorkspaceList />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="pending" className="mt-0 outline-none">
                        <Suspense fallback={null}>
                            <PendingInvitations />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
