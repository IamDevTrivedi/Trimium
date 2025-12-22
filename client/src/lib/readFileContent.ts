import fs from "fs";
import path from "path";

export function readFileContent(...pathParts: string[]): string {
    const filePath = path.join(process.cwd(), ...pathParts);
    try {
        const content = fs.readFileSync(filePath, "utf8");
        return content;
    } catch (error) {
        throw new Error(`Failed to read markdown file at ${filePath}: ${(error as Error).message}`);
    }
}
