import { useState, useEffect } from "react";
import {
  orderBy,
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";
import { TNote } from "../types";
import { db } from "../firebase";

export const useNotes = (bookId: string): Array<TNote> => {
  const [notes, setNotes] = useState<Array<TNote>>([]);

  useEffect(() => {
    const notesQuery = query(
      collection(db, "notes"),
      where("bookId", "==", bookId),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const snapshotNotes = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(snapshotNotes);
    });

    return () => unsubscribe();
  }, []);

  return notes;
};
