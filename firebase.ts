import { initializeApp } from "firebase/app";
import {
  getDoc,
  deleteDoc,
  getDocs,
  query,
  collection,
  where,
  addDoc,
  getFirestore,
  setDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOPhqxHeFvM-Ue83BCria8bNj19Zni4X0",
  authDomain: "whetstone-books.firebaseapp.com",
  projectId: "whetstone-books",
  storageBucket: "whetstone-books.appspot.com",
  messagingSenderId: "831340759975",
  appId: "1:831340759975:web:e81c6dfbf400e562504482",
  measurementId: "G-DKPRJZ1VTC",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth(app);

// API functions

export const createBook = (newBook: any): void => {
  addDoc(collection(db, "books"), newBook);
};

export const getFinishedBooks = async (): Promise<Array<any>> => {
  console.log("getFinishedBooks");
  let books: Array<any> = [];
  const booksQuery = query(
    collection(db, "books"),
    where("finished", "!=", null)
  );
  const snapshot = await getDocs(booksQuery);
  if (snapshot.empty) {
    console.log("No books found.");
  } else {
    snapshot.forEach((snap) => {
      books.push({ id: snap.id, ...snap.data() });
    });
  }
  console.log("finished books:", books);
  return books;
};

export const getUnfinishedBooks = async (): Promise<Array<any>> => {
  console.log("getUnfinishedBooks");
  let books: Array<any> = [];
  const booksQuery = query(
    collection(db, "books"),
    where("finished", "==", null)
  );
  const snapshot = await getDocs(booksQuery);
  if (snapshot.empty) {
    console.log("No books found.");
  } else {
    snapshot.forEach((snap) => {
      books.push({ id: snap.id, ...snap.data() });
    });
  }
  console.log("unfinished books:", books);
  return books;
};

export const getBook = async (bookRef: any): Promise<void> => {
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    const bookData = bookSnap.data();
    console.log("bookData:", JSON.stringify(bookData));
  } else {
    console.log("book does not exist");
  }
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

//const lotrRef = doc(db, "books/lotr");
//getBook(lotrRef);
