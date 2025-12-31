export interface ITAG {
    id: number;
    bg: string;
    text: string;
}

export const TAGS: ITAG[] = [
    { id: 1, bg: "bg-blue-500", text: "text-white" },
    { id: 2, bg: "bg-green-500", text: "text-white" },
    { id: 3, bg: "bg-purple-500", text: "text-white" },
    { id: 4, bg: "bg-pink-500", text: "text-white" },
    { id: 5, bg: "bg-yellow-500", text: "text-gray-900" },
    { id: 6, bg: "bg-red-500", text: "text-white" },
    { id: 7, bg: "bg-indigo-500", text: "text-white" },
    { id: 8, bg: "bg-teal-500", text: "text-white" },
    { id: 9, bg: "bg-orange-500", text: "text-white" },
    { id: 10, bg: "bg-cyan-500", text: "text-gray-900" },
    { id: 11, bg: "bg-lime-500", text: "text-gray-900" },
    { id: 12, bg: "bg-amber-500", text: "text-gray-900" },
    { id: 13, bg: "bg-emerald-500", text: "text-white" },
    { id: 14, bg: "bg-violet-500", text: "text-white" },
    { id: 15, bg: "bg-fuchsia-500", text: "text-white" },
    { id: 16, bg: "bg-rose-500", text: "text-white" },
    { id: 17, bg: "bg-sky-500", text: "text-white" },
    { id: 18, bg: "bg-slate-500", text: "text-white" },
    { id: 19, bg: "bg-gray-500", text: "text-white" },
    { id: 20, bg: "bg-zinc-500", text: "text-white" },
];

export const TAGS_ID_RANGE = TAGS.length;
export const DEFAULT_TAG = TAGS[0];
