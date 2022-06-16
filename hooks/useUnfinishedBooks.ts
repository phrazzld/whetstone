import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { TBook } from "../types";

export const useUnfinishedBooks = () => {
  const [books, setBooks] = useState<Array<TBook>>([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get books, user not logged in");
    }

    const booksQuery = query(
      collection(db, "users", auth.currentUser.uid, "books"),
      where("started", "!=", null),
      where("finished", "==", null),
      orderBy("started", "desc")
    );

    const unsubscribe = onSnapshot(booksQuery, (snapshot) => {
      const snapshotBooks: Array<TBook> = snapshot.docs.map(
        (doc: any): TBook => ({
          id: doc.id,
          ...doc.data(),
        })
      );
      setBooks(snapshotBooks);
      setLoading(false)
    });
    return () => unsubscribe();
  }, []);

  return { data: books, loading };
};
