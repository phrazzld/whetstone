import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { TBook } from "../types";

export const useUnreadBooks = () => {
  const [books, setBooks] = useState<Array<TBook>>([]);

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get books, user not logged in");
    }

    const booksQuery = query(
      collection(db, "users", auth.currentUser.uid, "books"),
      where("started", "==", null),
      where("finished", "==", null)
    );

    const unsubscribe = onSnapshot(booksQuery, (snapshot) => {
      const snapshotBooks: Array<TBook> = snapshot.docs.map(
        (doc: any): TBook => ({
          id: doc.id,
          ...doc.data(),
        })
      );
      setBooks(snapshotBooks);
    });
    return () => unsubscribe();
  }, []);

  return books;
};