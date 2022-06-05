import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { TNote } from "../types";

export const useStatusNotes = (bookId: string): Array<TNote> => {
  const [startedNotes, setStartedNotes] = useState<Array<TNote>>([]);
  const [finishedNotes, setFinishedNotes] = useState<Array<TNote>>([]);

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get notes, user not logged in.");
    }

    if (bookId !== "") {
      console.log("bookId:", bookId)
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

  // TODO: Sort notes by noteDate, with most recent note being first
  return startedNotes.concat(...finishedNotes);
};
