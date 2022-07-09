import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNote } from "./firebase";
import { BookPayload, NotePayload, TBook, TNote, VocabPayload } from "./types";

type ActionKey =
  | "create book"
  | "delete book"
  | "update book"
  | "create note"
  | "delete note"
  | "update note";

type ActionPayload = {
  id?: string;
  body: BookPayload | NotePayload | VocabPayload;
};

export const UNFINISHED_BOOKS_KEY = "unfinished books";
export const FINISHED_BOOKS_KEY = "finished books";
export const UNREAD_BOOKS_KEY = "unread books";
export const NOTES_KEY = "notes";

export const ACTIONS = {
  CREATE_BOOK: "create book",
  DELETE_BOOK: "delete book",
  UPDATE_BOOK: "update book",
  CREATE_NOTE: "create note",
  DELETE_NOTE: "delete note",
  UPDATE_NOTE: "update note",
};

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

export const addLocalNote = async (
  bookId: string,
  note: TNote
): Promise<void> => {
  const notes = await getLocalNotes(bookId);
  notes.push(note);
  return await setLocalNotes(bookId, notes);
};

const getActions = async (key: ActionKey): Promise<Array<ActionPayload>> => {
  const actions = await AsyncStorage.getItem(key);
  return JSON.parse(actions || "[]");
};

// TODO: disable UI for actions without offline support
export const queueAction = async (
  key: ActionKey,
  payload: ActionPayload
): Promise<void> => {
  // Get queued actions
  let actions: Array<ActionPayload> = await getActions(key);
  // Queue new action
  const newAction = payload;
  actions.push(newAction);
  // Set stringified actions queue
  return await AsyncStorage.setItem(key, JSON.stringify(actions));
};

export const processAction = async (
  key: ActionKey,
  payload: ActionPayload
): Promise<void> => {
  // Hit Firebase
  // Throw an error and halt execution if API call fails
  // We want to keep the action in the queue if it fails
  try {
    switch (key) {
      case "create note":
        if (!payload.id) {
          throw new Error("CREATE_NOTE action requires id attr on payload");
        }
        await createNote(payload.id, payload.body as NotePayload);
        break;
      // TODO: Add handling for each case
      default:
        console.error(`Cannot process unrecognized action key: ${key}`);
        throw new Error(`Cannot process unrecognized action key: ${key}`);
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }

  // If the Firebase creation succeeds, remove the action from local storage
  let actions: Array<ActionPayload> = await getActions(key);
  actions = actions.filter(
    (action: any) => JSON.stringify(action) !== JSON.stringify(payload)
  );
  return await AsyncStorage.setItem(key, JSON.stringify(actions));
};

export const processActions = async (key: ActionKey): Promise<void> => {
  try {
    const actionsStr: string | null = await AsyncStorage.getItem(key);
    const actions = JSON.parse(actionsStr || "[]");
    // TODO: Verify that this works fine when some actions fail to process
    actions.forEach((action: any) => processAction(key, action));
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};
