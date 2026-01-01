import { DEFAULT_TAG, ITAG, TAGS } from "@/constants/tags";

export const getTagById = (id: number): ITAG | undefined => {
    return TAGS.find((tag) => tag.id === id);
};

export const getTagStyles = (tagID: number): { bg: string; text: string } => {
    const tag = getTagById(tagID);
    return tag ? { bg: tag.bg, text: tag.text } : { bg: DEFAULT_TAG.bg, text: DEFAULT_TAG.text };
};
