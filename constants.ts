import { TBookList } from "./types";

export const dateLocaleStringOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
} as const;

export const TABS = {
  READING: 0,
  FINISHED: 1,
  UNREAD: 2
} as const

export const LISTS: Array<TBookList> = ["Reading", "Finished", "Unread"];
