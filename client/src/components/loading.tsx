import { Spinner } from "@/components/ui/spinner";

export function LoadingPage() {
    return (
        <div className="absolute bg-background z-10 top-0 left-0 flex justify-center items-center h-screen w-full">
            <Spinner className="size-10" />
        </div>
    );
}
