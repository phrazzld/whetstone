import { StatusBar } from "expo-status-bar";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { auth, db } from "./firebase";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { TBook } from "./types";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // For the current user, and for each book, get the notes
  // Update each note without a date field to have a date field equal to the note's createdAt
  useEffect(() => {
    const updateNoteDates = async () => {
      console.log("Updating note dates...");
      const user = auth.currentUser;
      console.log("user", user);

      if (user) {
        console.log("user exists");
        const userRef = doc(db, "users", user.uid);
        const bookRefs = await getDocs(query(collection(userRef, "books")));

        console.log("bookRefs.size:", bookRefs.size);
        bookRefs.forEach(async (bookRef) => {
          const noteRefs = await getDocs(
            query(collection(userRef, "books", bookRef.id, "notes"))
          );
          console.log("noteRefs.size:", noteRefs.size);
          noteRefs.forEach(async (noteRef) => {
            const note = noteRef.data();
            if (note.createdAt && !note.date) {
              console.log("Updating note", noteRef.id);
              await setDoc(
                doc(
                  db,
                  "users",
                  user.uid,
                  "books",
                  bookRef.id,
                  "notes",
                  noteRef.id
                ),
                {
                  ...note,
                  date: note.createdAt,
                }
              );
              console.log("Updated note", noteRef.id);
            }
          });
        });

        console.log("Done updating note dates.");
      }
    };

    updateNoteDates();
  }, [JSON.stringify(auth.currentUser)]);

  // Update all books in the current user's books subcollection with the following:
  // - New "list" field that is either "reading", "finished", or "unread"
  // - New "lastFinished" field that is a date or null, initialized with current value for "finished"
  // - New "lastStarted" field that is a date or null, initialized with current value for "started"
  // - Convert existing "started" and "finished" fields to docs in the notes subcollection
  //   - "started" should be a doc with a "date" field and a "type" field with value "started"
  //   - "finished" should be a doc with a "date" field and a "type" field with value "finished"
  // - Add flag to indicate that this has been done
  // - Delete "started" and "finished" fields
  // - Don't run this code again if the flag is set
  // - Use exported db and auth objects from firebase.ts
  useEffect(() => {
    const runMigration = async () => {
      console.log("Running migration...");
      const user = auth.currentUser;
      console.log("User:", user);
      if (user) {
        console.log("User is logged in");
        console.log("user.uid", user.uid);
        const booksCollection = collection(db, "users", user.uid, "books");
        const booksQuery = query(booksCollection);
        const booksSnapshot = await getDocs(booksQuery);
        const books: TBook[] = booksSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as TBook)
        );
        for (const book of books) {
          if (book.migrated) {
            console.log("Book already migrated");
            return;
          }
          console.log("Migrating book...", book);
          console.log("Updating book", book.id);
          const bookDoc = doc(db, "users", user.uid, "books", book.id);
          const bookRef = await getDoc(bookDoc);
          if (bookRef.exists()) {
            console.log("Book doc exists");
            const bookData = bookRef.data();
            const bookNotesCollection = collection(
              db,
              "users",
              user.uid,
              "books",
              book.id,
              "notes"
            );
            if (bookData?.started) {
              const startedNote = {
                date: bookData.started,
                type: "started",
                createdAt: new Date(),
              };
              await setDoc(doc(bookNotesCollection), startedNote);
            }
            if (bookData?.finished) {
              const finishedNote = {
                date: bookData.finished,
                type: "finished",
                createdAt: new Date(),
              };
              await setDoc(doc(bookNotesCollection), finishedNote);
            }
            const updatedBook: TBook = {
              ...bookData,
              list: bookData?.finished
                ? "finished"
                : bookData?.started
                ? "reading"
                : "unread",
              lastFinished: bookData?.finished,
              lastStarted: bookData?.started,
              migrated: true,
            } as TBook;
            delete updatedBook.started;
            delete updatedBook.finished;
            await setDoc(bookDoc, updatedBook);
          }
        }
        console.log("Books migration done");
      }
    };
    runMigration();
  }, [JSON.stringify(auth.currentUser)]);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }
}
