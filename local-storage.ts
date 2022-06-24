import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBook } from "./firebase";
import { BookPayload, NotePayload, TBook, TNote, VocabPayload } from "./types";

type ActionKey =
  | "create book"
  | "delete book"
  | "update book"
  | "create note"
  | "delete note"
  | "update note";

type ActionPayload = BookPayload | NotePayload | VocabPayload;

export const BOOKS_KEY = "books";
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

export const setLocalBooks = async (books: Array<TBook>): Promise<void> => {
  return await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
};

export const getLocalBooks = async (): Promise<Array<TBook>> => {
  const books = await AsyncStorage.getItem(BOOKS_KEY);
  return JSON.parse(books);
};

export const setLocalNotes = async (notes: Array<TNote>): Promise<void> => {
  return await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const getLocalNotes = async (): Promise<Array<TNote>> => {
  const notes = await AsyncStorage.getItem(NOTES_KEY);
  return JSON.parse(notes);
};

export const queueAction = async (
  key: ActionKey,
  payload: ActionPayload
): Promise<void> => {
  // Get queued actions
  let actions = await AsyncStorage.getItem(key);
  // Parse them
  actions = JSON.parse(actions);
  // Queue new action
  const newAction = payload;
  actions = actions.push(newAction);
  // Set stringified actions queue
  return await AsyncStorage.setItem(key, actions);
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
      case "create book":
        await createBook(payload as BookPayload);
        break;
      // TODO: Add handling for each case
      // TODO: Refactor payload types and firebase function parameters
      //       Need to take id as attr on payload
      default:
        console.error(`Cannot process unrecognized action key: ${key}`);
        throw new Error(`Cannot process unrecognized action key: ${key}`);
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }

  // If the Firebase creation succeeds, remove the action from local storage
  let actions = await AsyncStorage.getItem(key);
  actions = JSON.parse(actions);
  actions = actions.filter(
    (action: any) => JSON.stringify(action) !== JSON.stringify(payload)
  );
  return await AsyncStorage.setItem(key, actions);
};

// TODO: Define process for processing queue
//       Perhaps useEffect with netInfo in dep array?
//       Whenever we go from offline to online, process actions queue
export const processCreateBookAction = async (
  createBookAction: BookPayload
): Promise<void> => {
  // Create the book in Firebase
  // Throw an error and halt execution if creation fails
  // We want to keep the action in the queue if it fails
  try {
    await createBook(createBookAction);
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }

  // If the Firebase creation succeeds, remove the action from local storage
  let actions = await AsyncStorage.getItem(ACTIONS.CREATE_BOOK);
  actions = JSON.parse(actions);
  actions = actions.filter(
    (action: any) => JSON.stringify(action) !== JSON.stringify(createBookAction)
  );
  return await AsyncStorage.setItem(ACTIONS.CREATE_BOOK, actions);
};
