import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getLocalNotes, setLocalNotes } from "../local-storage";
import { TNote } from "../types";
import { ensureDate } from "../utils";

type Signature = {
  data: Array<TNote>;
  loading: boolean;
};

export const useNotes = (bookId: string): Signature => {
  const [notes, setNotes] = useState<Array<TNote>>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  const fetchLocalNotes = async (): Promise<void> => {
    const localNotes = await getLocalNotes(bookId);
    if (firebaseLoading) {
      setNotes(localNotes);
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get notes, user not logged in.");
    }

    fetchLocalNotes();

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
      setFirebaseLoading(false);

      const localNotes = snapshotNotes.map((note: TNote) => {
        let n = note;
        if (!!n.createdAt) {
          n.createdAt = ensureDate(n.createdAt);
        }
        if (!!n.updatedAt) {
          n.updatedAt = ensureDate(n.updatedAt);
        }

        return n;
      });
      setLocalNotes(bookId, localNotes);
    });

    return () => unsubscribe();
  }, []);

  return { data: notes, loading: localLoading && firebaseLoading };
};
