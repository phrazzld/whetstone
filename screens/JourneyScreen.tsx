import { useEffect, useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Book } from "../components/Book";
import { TBook } from "../types";
import { collection, where, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function JourneyScreen() {
  const [books, setBooks] = useState<Array<TBook>>([]);

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get books, user not logged in");
    }

    const booksQuery = query(
      collection(db, "books"),
      where("finished", "!=", null),
      where("userId", "==", auth.currentUser.uid)
    );
    const observer = onSnapshot(booksQuery, (snapshot) => {
      let localBooks: Array<TBook> = [];
      snapshot.forEach((s) => {
        console.log(s.id, JSON.stringify(s.data()));
        localBooks.push({ id: s.id, ...s.data() });
      });
      setBooks(localBooks);
    });

    return () => {
      observer();
    };
  }, []);

  if (!books) {
    return <></>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {books.map((book) => (
        <Book key={book.id} book={book} />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
