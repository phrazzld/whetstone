import AsyncStorage from "@react-native-async-storage/async-storage";
import { TBook, TNote } from "./types";

export const UNFINISHED_BOOKS_KEY = "unfinished books";
export const FINISHED_BOOKS_KEY = "finished books";
export const UNREAD_BOOKS_KEY = "unread books";
export const NOTES_KEY = "notes";

export const clearStorage = async (): Promise<Array<void>> => {
  const promises: Array<Promise<void>> = [];

  const keys = await AsyncStorage.getAllKeys();
  promises.push(AsyncStorage.multiRemove(keys));

  return Promise.all(promises);
};

export const setLocalUnfinishedBooks = async (
  books: Array<TBook>
): Promise<void> => {
  return await AsyncStorage.setItem(
    UNFINISHED_BOOKS_KEY,
    JSON.stringify(books)
  );
};

export const getLocalUnfinishedBooks = async (): Promise<Array<TBook>> => {
  const books = await AsyncStorage.getItem(UNFINISHED_BOOKS_KEY);
  return JSON.parse(books || "");
};

export const setLocalFinishedBooks = async (
  books: Array<TBook>
): Promise<void> => {
  return await AsyncStorage.setItem(FINISHED_BOOKS_KEY, JSON.stringify(books));
};

export const getLocalFinishedBooks = async (): Promise<Array<TBook>> => {
  const books = await AsyncStorage.getItem(FINISHED_BOOKS_KEY);
  return JSON.parse(books || "");
};

export const setLocalUnreadBooks = async (
  books: Array<TBook>
): Promise<void> => {
  return await AsyncStorage.setItem(UNREAD_BOOKS_KEY, JSON.stringify(books));
};

export const getLocalUnreadBooks = async (): Promise<Array<TBook>> => {
  const books = await AsyncStorage.getItem(UNREAD_BOOKS_KEY);
  return JSON.parse(books || "");
};

export const setLocalNotes = async (
  bookId: string,
  notes: Array<TNote>
): Promise<void> => {
  return await AsyncStorage.setItem(
    `${bookId} ${NOTES_KEY}`,
    JSON.stringify(notes)
  );
};

export const getLocalNotes = async (bookId: string): Promise<Array<TNote>> => {
  const notes = await AsyncStorage.getItem(`${bookId} ${NOTES_KEY}`);
  return JSON.parse(notes || "");
};
