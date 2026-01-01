export interface ITAG {
    id: number;
    bg: string;
    text: string;
    displayName: string;
}

export const TAGS: ITAG[] = [
    { id: 1, bg: "bg-blue-500", text: "text-white", displayName: "Ocean" },
    { id: 2, bg: "bg-green-500", text: "text-white", displayName: "Forest" },
    { id: 3, bg: "bg-purple-500", text: "text-white", displayName: "Grape" },
    { id: 4, bg: "bg-pink-500", text: "text-white", displayName: "Blossom" },
    { id: 5, bg: "bg-yellow-500", text: "text-gray-900", displayName: "Sunshine" },
    { id: 6, bg: "bg-red-500", text: "text-white", displayName: "Cherry" },
    { id: 7, bg: "bg-indigo-500", text: "text-white", displayName: "Midnight" },
    { id: 8, bg: "bg-teal-500", text: "text-white", displayName: "Aqua" },
    { id: 9, bg: "bg-orange-500", text: "text-white", displayName: "Tangerine" },
    { id: 10, bg: "bg-cyan-500", text: "text-gray-900", displayName: "Sky" },
    { id: 11, bg: "bg-lime-500", text: "text-gray-900", displayName: "Citrus" },
    { id: 12, bg: "bg-amber-500", text: "text-gray-900", displayName: "Honey" },
    { id: 13, bg: "bg-emerald-500", text: "text-white", displayName: "Jade" },
    { id: 14, bg: "bg-violet-500", text: "text-white", displayName: "Lavender" },
    { id: 15, bg: "bg-fuchsia-500", text: "text-white", displayName: "Magenta" },
    { id: 16, bg: "bg-rose-500", text: "text-white", displayName: "Rose" },
    { id: 17, bg: "bg-sky-500", text: "text-white", displayName: "Azure" },
    { id: 18, bg: "bg-slate-500", text: "text-white", displayName: "Slate" },
    { id: 19, bg: "bg-gray-500", text: "text-white", displayName: "Ash" },
    { id: 20, bg: "bg-zinc-500", text: "text-white", displayName: "Steel" },
];

export const TAGS_ID_RANGE = TAGS.length;
export const DEFAULT_TAG = TAGS[0];

export const getTagById = (id: number): ITAG | undefined => {
    return TAGS.find((tag) => tag.id === id);
};

export const getTagStyles = (tagID: number): { bg: string; text: string } => {
    const tag = getTagById(tagID);
    return tag ? { bg: tag.bg, text: tag.text } : { bg: DEFAULT_TAG.bg, text: DEFAULT_TAG.text };
};
