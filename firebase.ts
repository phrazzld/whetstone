import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

export const createBook = async (newBook: any): Promise<any> => {
  const docRef = await addDoc(collection(db, "books"), newBook);
  return docRef;
};

export const getBooks = async (): Promise<Array<any>> => {
  let books: Array<any> = [];
  const booksQuery = query(collection(db, "books"));
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
  let books: Array<any> = [];
  const booksQuery = query(
    collection(db, "books"),
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
  let books: Array<any> = [];
  const booksQuery = query(
    collection(db, "books"),
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

export const getBook = async (bookRef: any): Promise<any> => {
  let bookData;
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    bookData = bookSnap.data();
  } else {
    console.log("book does not exist");
  }
  return bookData;
};

export const deleteBook = async (bookId: string): Promise<void> => {
  try {
    const bookRef = doc(collection(db, "books"), bookId);
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
    const bookRef = doc(collection(db, "books"), bookId);
    await setDoc(bookRef, payload, { merge: true });
  } catch (err) {
    console.error("error finishing book:", err);
  }
};

// Notes

export const createNote = (newNote: any): void => {
  addDoc(collection(db, "notes"), newNote);
};

export const getBookNotes = async (bookId: string): Promise<Array<any>> => {
  let notes: Array<any> = [];
  const notesQuery = query(
    collection(db, "notes"),
    where("bookId", "==", bookId)
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

export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const noteRef = doc(collection(db, "notes"), noteId);
    await deleteDoc(noteRef);
  } catch (err) {
    console.error("error deleting note:", err);
  }
};
