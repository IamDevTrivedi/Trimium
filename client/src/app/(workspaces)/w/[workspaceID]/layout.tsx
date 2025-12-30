import { ProtectWorkspace } from "@/components/protect-workspace";

export default function layout({ children }: { children: React.ReactNode }) {
    return <ProtectWorkspace>{children}</ProtectWorkspace>;
}
