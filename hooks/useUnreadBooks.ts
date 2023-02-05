import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getLocalUnreadBooks, setLocalUnreadBooks } from "../local-storage";
import { TBook } from "../types";
import { ensureDate } from "../utils";

type Signature = {
  data: Array<TBook>;
  loading: boolean;
};

export const useUnreadBooks = (): Signature => {
  const [books, setBooks] = useState<Array<TBook>>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  const fetchLocalBooks = async (): Promise<void> => {
    const localBooks = await getLocalUnreadBooks();
    if (firebaseLoading) {
      setBooks(localBooks);
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get books, user not logged in");
    }

    fetchLocalBooks();

    const booksQuery = query(
      collection(db, "users", auth.currentUser.uid, "books"),
      where("list", "==", "unread")
    );

    const unsubscribe = onSnapshot(booksQuery, (snapshot) => {
      const snapshotBooks: Array<TBook> = snapshot.docs.map(
        (doc: any): TBook => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      // Shuffle the books
      const shuffledBooks = snapshotBooks.sort(() => Math.random() - 0.5);
      setBooks(shuffledBooks);
      setFirebaseLoading(false);

      const localBooks = snapshotBooks.map((book: TBook) => {
        let b = book;
        if (!!b.started) {
          b.started = ensureDate(b.started);
        }
        if (!!b.finished) {
          b.finished = ensureDate(b.finished);
        }
        if (!!b.createdAt) {
          b.createdAt = ensureDate(b.createdAt);
        }
        if (!!b.updatedAt) {
          b.updatedAt = ensureDate(b.updatedAt);
        }

        return b;
      });
      setLocalUnreadBooks(localBooks);
    });
    return () => unsubscribe();
  }, []);

  return { data: books, loading: localLoading && firebaseLoading };
};
