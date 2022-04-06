import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { View } from "../components/Themed";
import { RootTabScreenProps, TBook } from "../types";
import {
  collection,
  query,
  getDocs,
  addDoc,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useRoute } from "@react-navigation/native";

export default function ReadingScreen({
  navigation,
}: RootTabScreenProps<"Reading">) {
  const [books, setBooks] = useState<Array<TBook>>([]);
  const route = useRoute();

  const getBooks = async () => {
    let localBooks: Array<TBook> = [];
    const booksQuery = query(collection(db, "books"));
    const querySnapshot = await getDocs(booksQuery);
    querySnapshot.forEach((snap) => {
      console.log(
        "snap.id:",
        snap.id,
        ":: snap.data:",
        JSON.stringify(snap.data())
      );
      localBooks.push({ id: snap.id, ...snap.data() });
    });
    setBooks(localBooks);
  };

  useEffect(() => {
    getBooks();
  }, [route.params]);

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
