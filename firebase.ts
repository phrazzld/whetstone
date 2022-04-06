// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDoc,
  deleteDoc,
  getDocs,
  query,
  collection,
  addDoc,
  getFirestore,
  setDoc,
  doc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// API functions

export const createBook = async (newBook) => {
  addDoc(collection(db, "books"), newBook);
};

export const getBooks = async () => {
  let books = [];
  const booksQuery = query(collection(db, "books"));
  const querySnapshot = await getDocs(booksQuery);
  querySnapshot.forEach((snap) => {
    books.push({ id: snap.id, ...snap.data() });
  });
  return books;
};

export const getBook = async (bookRef) => {
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    const bookData = bookSnap.data();
    console.log("bookData:", JSON.stringify(bookData));
  } else {
    console.log("book does not exist");
  }
};

export const deleteBook = async (bookId: string) => {
  try {
    const bookRef = doc(collection(db, "books"), bookId);
    await deleteDoc(bookRef);
  } catch (err) {
    console.error("error deleting book:", err);
  }
};

//const lotrRef = doc(db, "books/lotr");
//getBook(lotrRef);
