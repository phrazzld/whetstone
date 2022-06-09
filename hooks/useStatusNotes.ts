import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { TNote } from "../types";
import { ensureDate } from "../utils";

export const useStatusNotes = (bookId: string): Array<TNote> => {
  const [startedNotes, setStartedNotes] = useState<Array<TNote>>([]);
  const [finishedNotes, setFinishedNotes] = useState<Array<TNote>>([]);

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get notes, user not logged in.");
    }

    if (bookId !== "") {
      console.log("bookId:", bookId);
      const startedNotesQuery = query(
        collection(db, "users", auth.currentUser.uid, "books", bookId, "notes"),
        where("type", "==", "started")
      );
      const unsubscribeStartedNotes = onSnapshot(
        startedNotesQuery,
        (snapshot) => {
          const snapshotStartedNotes = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStartedNotes(snapshotStartedNotes);
        }
      );

      const finishedNotesQuery = query(
        collection(db, "users", auth.currentUser.uid, "books", bookId, "notes"),
        where("type", "==", "finished")
      );
      const unsubscribeFinishedNotes = onSnapshot(
        finishedNotesQuery,
        (snapshot) => {
          const snapshotFinishedNotes = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFinishedNotes(snapshotFinishedNotes);
        }
      );

      return () => {
        unsubscribeStartedNotes();
        unsubscribeFinishedNotes();
      };
    }
  }, [bookId]);

  // Combine the started and finished status notes and sort them in descending order (most recent first)
  return startedNotes.concat(...finishedNotes).sort((a: TNote, b: TNote) => {
    if (!a.date || !b.date) {
      throw new Error("Cannot sort status notes, one does not have a date");
    }
    return ensureDate(b.date).getTime() - ensureDate(a.date).getTime();
  });
};
