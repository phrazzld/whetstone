import { collection, doc, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { TNote } from "../types";

type Signature = {
  data: Array<TNote>;
  loading: boolean;
};

export const useAllFinishedNotes = (): Signature => {
  const [finishedNotes, setFinishedNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!auth.currentUser) {
        throw new Error("Cannot get notes, user not logged in.");
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const bookRefs = await getDocs(query(collection(userRef, "books")));

      bookRefs.forEach(async (bookRef) => {
        const noteRefs = await getDocs(
          query(collection(userRef, "books", bookRef.id, "notes"))
        );
        noteRefs.forEach((noteRef) => {
          if (noteRef.data().type === "finished") {
            setFinishedNotes((prevNotes) => [...prevNotes, noteRef.data()]);
          }
        });
      });
      setLoading(false);
    };

    fetchData();
  }, [JSON.stringify(auth.currentUser)]);

  return { data: finishedNotes, loading };
};
