import { Metadata } from "next";
import { LinkhubEditor } from "@/components/linkhub-editor";
import { ProtectPage } from "@/components/protect-page";

export const metadata: Metadata = {
    title: "Link Profile",
    description:
        "Create and customize your personal link-in-bio page. Add links, social profiles, and choose a theme.",
};

export default function LinkhubPage() {
    return (
        <ProtectPage>
            <div className="w-full max-w-6xl mx-auto px-4 py-8 my-12">
                <LinkhubEditor />
            </div>
        </ProtectPage>
    );
}
