import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { TNote } from "../types";

export const useNotes = (bookId: string): Array<TNote> => {
  const [notes, setNotes] = useState<Array<TNote>>([]);

  useEffect(() => {
    const notesQuery = query(
      collection(db, "books", bookId, "notes"),
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
