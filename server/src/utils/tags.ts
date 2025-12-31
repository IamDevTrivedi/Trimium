import { ITAG, TAGS } from "@/constants/tags";

export const tagIDToTag = (id: number): ITAG | undefined => {
    return TAGS.find((tag) => tag.id === id);
};
