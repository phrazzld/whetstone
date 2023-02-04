import { Dimensions } from "react-native";
import { TBookList } from "./types";

export const windowWidth = Dimensions.get("window").width;
export const windowHeight = Dimensions.get("window").height;

export const TABS = {
  READING: 0,
  FINISHED: 1,
  UNREAD: 2,
};

export const dateLocaleStringOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
} as const;

export const LISTS: Array<TBookList> = ["reading", "finished", "unread"];
