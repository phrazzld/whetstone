import { useEffect, useState } from "react";
import { TBook } from "../types";
import { auth, db } from "../firebase";
import { collection, where, query, onSnapshot } from "firebase/firestore";

export const useFinishedBooks = () => {
  const [books, setBooks] = useState<Array<TBook>>([]);

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get books, user not logged in");
    }

    const booksQuery = query(
      collection(db, "books"),
      where("finished", "!=", null),
      where("userId", "==", auth.currentUser.uid)
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
