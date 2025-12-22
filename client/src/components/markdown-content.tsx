import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

// ShadCN Typography components for react-markdown with improved spacing
const markdownComponents: Components = {
    h1: ({ ...props }) => (
        <h1
            className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8 mt-12 first:mt-0"
            {...props}
        />
    ),
    h2: ({ ...props }) => (
        <h2
            className="scroll-m-20 border-b pb-3 text-3xl font-semibold tracking-tight mt-12 mb-6 first:mt-0"
            {...props}
        />
    ),
    h3: ({ ...props }) => (
        <h3
            className="scroll-m-20 text-2xl font-semibold tracking-tight mt-10 mb-4 first:mt-0"
            {...props}
        />
    ),
    h4: ({ ...props }) => (
        <h4
            className="scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-3 first:mt-0"
            {...props}
        />
    ),
    h5: ({ ...props }) => (
        <h5
            className="scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-3 first:mt-0"
            {...props}
        />
    ),
    h6: ({ ...props }) => (
        <h6
            className="scroll-m-20 text-base font-semibold tracking-tight mt-6 mb-2 first:mt-0"
            {...props}
        />
    ),
    p: ({ ...props }) => <p className="leading-7 mb-6 last:mb-0" {...props} />,
    blockquote: ({ ...props }) => (
        <blockquote
            className="border-l-4 border-primary pl-6 py-2 my-6 italic text-primary"
            {...props}
        />
    ),
    ul: ({ ...props }) => (
        <ul className="my-6 ml-6 space-y-2 list-disc marker:text-primary" {...props} />
    ),
    ol: ({ ...props }) => (
        <ol className="my-6 ml-6 space-y-2 list-decimal marker:text-primary" {...props} />
    ),
    li: ({ ...props }) => <li className="leading-7" {...props} />,
    pre: ({ ...props }) => (
        <pre className="my-6 overflow-x-auto rounded-lg border bg-black p-4" {...props} />
    ),
    table: ({ ...props }) => (
        <div className="my-8 w-full overflow-y-auto rounded-lg border">
            <table className="w-full border-collapse" {...props} />
        </div>
    ),
    thead: ({ ...props }) => <thead className="bg-primary-foreground" {...props} />,
    tr: ({ ...props }) => (
        <tr className="border-b transition-colors hover:bg-accent/50" {...props} />
    ),
    th: ({ ...props }) => (
        <th
            className="px-4 py-3 text-left font-semibold [[align=center]]:text-center [[align=right]]:text-right"
            {...props}
        />
    ),
    td: ({ ...props }) => (
        <td
            className="px-4 py-3 text-left [[align=center]]:text-center [[align=right]]:text-right"
            {...props}
        />
    ),
    a: ({ ...props }) => (
        <a
            className="font-medium underline underline-offset-4 hover:text-primary/75 transition-colors"
            {...props}
        />
    ),
    hr: ({ ...props }) => <hr className="my-8 border-primary" {...props} />,
    strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
    em: ({ ...props }) => <em className="italic" {...props} />,
};

export function MarkdownContent({ content }: { content: string }) {
    return (
        <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        </div>
    );
}
