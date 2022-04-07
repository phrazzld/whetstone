import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { View } from "../components/Themed";
import { RootTabScreenProps, TBook } from "../types";
import { collection, where, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function ReadingScreen({
  navigation,
}: RootTabScreenProps<"Reading">) {
  const [books, setBooks] = useState<Array<TBook>>([]);

  useEffect(() => {
    if (!auth.currentUser) {
      throw new Error("Cannot get books, user not logged in");
    }

    const booksQuery = query(
      collection(db, "books"),
      where("finished", "==", null),
      where("userId", "==", auth.currentUser.uid)
    );
    const observer = onSnapshot(booksQuery, (snapshot) => {
      let localBooks: Array<TBook> = [];
      snapshot.forEach((s) => {
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
    <View style={styles.container}>
      {books.map((book) => (
        <Book key={book.id} book={book} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
