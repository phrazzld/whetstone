import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { BookPayload, NotePayload, VocabPayload, StatusNotePayload } from "./types";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseProdConfig = {
  apiKey: "AIzaSyAOPhqxHeFvM-Ue83BCria8bNj19Zni4X0",
  authDomain: "whetstone-books.firebaseapp.com",
  projectId: "whetstone-books",
  storageBucket: "whetstone-books.appspot.com",
  messagingSenderId: "831340759975",
  appId: "1:831340759975:web:e81c6dfbf400e562504482",
  measurementId: "G-DKPRJZ1VTC",
};

// Dev config
const firebaseDevConfig = {
  apiKey: "AIzaSyBTHDrFhCqDnv0KQdgDLEs9YN8xTMYb01k",
  authDomain: "whetstone-dev.firebaseapp.com",
  projectId: "whetstone-dev",
  storageBucket: "whetstone-dev.appspot.com",
  messagingSenderId: "530102487904",
  appId: "1:530102487904:web:f961a347946e6a65762c05",
};

const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? firebaseProdConfig
    : firebaseDevConfig;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth(app);
export const storage = getStorage(app);

// API functions

// Books

export const createBook = async (newBook: BookPayload): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error("Cannot create note, user is not logged in.");
  }

  const userRef = doc(db, "users", auth.currentUser.uid);
  const bookRef = await addDoc(collection(userRef, "books"), newBook);
  return bookRef;
};

export const getBooks = async (): Promise<Array<any>> => {
  if (!auth.currentUser) {
    throw new Error("Cannot get books, no user is logged in.");
  }

  let books: Array<any> = [];
  const booksQuery = query(
    collection(db, "users", auth.currentUser.uid, "books")
  );
  const snapshot = await getDocs(booksQuery);
  if (snapshot.empty) {
    console.log("No books found.");
  } else {
    snapshot.forEach((snap) => {
      books.push({ id: snap.id, ...snap.data() });
    });
  }
  return books;
};

export const getFinishedBooks = async (): Promise<Array<any>> => {
  if (!auth.currentUser) {
    throw new Error("Cannot get books, no user is logged in.");
  }

  let books: Array<any> = [];
  const booksQuery = query(
    collection(db, "users", auth.currentUser.uid, "books"),
    where("finished", "!=", null),
    orderBy("finished")
  );
  const snapshot = await getDocs(booksQuery);
  if (snapshot.empty) {
    console.log("No books found.");
  } else {
    snapshot.forEach((snap) => {
      books.push({ id: snap.id, ...snap.data() });
    });
  }
  return books;
};

export const getUnfinishedBooks = async (): Promise<Array<any>> => {
  if (!auth.currentUser) {
    throw new Error("Cannot get books, no user is logged in.");
  }

  let books: Array<any> = [];
  const booksQuery = query(
    collection(db, "users", auth.currentUser.uid, "books"),
    where("finished", "==", null),
    orderBy("started")
  );
  const snapshot = await getDocs(booksQuery);
  if (snapshot.empty) {
    console.log("No books found.");
  } else {
    snapshot.forEach((snap) => {
      books.push({ id: snap.id, ...snap.data() });
    });
  }
  return books;
};

export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Cannot update book, user is not logged in.");
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const bookRef = doc(userRef, "books", bookId);
    await deleteDoc(bookRef);
  } catch (err) {
    console.error("error deleting book:", err);
  }
};

export const updateBook = async (
  bookId: string,
  payload: any
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Cannot update book, user is not logged in.");
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const bookRef = doc(userRef, "books", bookId);
    await setDoc(bookRef, payload, { merge: true });
  } catch (err) {
    console.error("error updating book:", err);
  }
};

// Notes

export const createNote = (bookId: string, newNote: NotePayload | VocabPayload | StatusNotePayload): void => {
  if (!auth.currentUser) {
    throw new Error("Cannot create note, user is not logged in.");
  }

  const userRef = doc(db, "users", auth.currentUser.uid);
  const bookRef = doc(userRef, "books", bookId);
  addDoc(collection(bookRef, "notes"), newNote);
};

export const getBookNotes = async (bookId: string): Promise<Array<any>> => {
  if (!auth.currentUser) {
    throw new Error("Cannot get notes, user is not logged in.");
  }
  let notes: Array<any> = [];

  const notesQuery = query(
    collection(db, "users", auth.currentUser.uid, "books", bookId, "notes")
  );
  const snapshot = await getDocs(notesQuery);
  if (snapshot.empty) {
    console.log("No notes found.");
  } else {
    snapshot.forEach((snap) => {
      notes.push({ id: snap.id, ...snap.data() });
    });
  }
  return notes;
};

export const deleteNote = async (
  bookId: string,
  noteId: string
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Cannot delete note, user is not logged in.");
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const bookRef = doc(userRef, "books", bookId);
    await deleteDoc(doc(bookRef, "notes", noteId));
  } catch (err) {
    console.error("error deleting note:", err);
  }
};

export const updateNote = async (
  bookId: string,
  noteId: string,
  payload: NotePayload | VocabPayload | StatusNotePayload
): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("Cannot update note, user is not logged in.");
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const bookRef = doc(userRef, "books", bookId);
    const noteRef = doc(bookRef, "notes", noteId);
    await setDoc(noteRef, payload, { merge: true });
  } catch (err) {
    console.error("error updating book:", err);
  }
};
