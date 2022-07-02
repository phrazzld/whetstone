import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { TNote } from "../types";

type Signature = {
  data: Array<TNote>;
  loading: boolean;
};

export const useNotes = (bookId: string): Signature => {
  const [notes, setNotes] = useState<Array<TNote>>([]);
  const [loading, setLoading] = useState(true);

  // TODO: Use local storage first, then update from Firebase
  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get notes, user not logged in.");
    }

    const notesQuery = query(
      collection(db, "users", auth.currentUser.uid, "books", bookId, "notes"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const snapshotNotes = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(snapshotNotes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { data: notes, loading };
};
