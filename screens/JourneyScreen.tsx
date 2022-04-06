import { useEffect, useState } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { Book } from "../components/Book";
import { View } from "../components/Themed";
import { TBook } from "../types";
import { getFinishedBooks } from "../firebase";
import { useRoute } from "@react-navigation/native";

export default function JourneyScreen() {
  const [books, setBooks] = useState<Array<TBook>>([]);
  const route = useRoute();

  const fetchAndSetBooks = async () => {
    const localBooks = await getFinishedBooks();
    setBooks(localBooks);
  };

  useEffect(() => {
    fetchAndSetBooks();
  }, [route.params]);

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
