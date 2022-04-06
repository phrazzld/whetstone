import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { View } from "../components/Themed";
import { RootTabScreenProps, TBook } from "../types";
import { getUnfinishedBooks } from "../firebase";
import { useRoute } from "@react-navigation/native";

export default function ReadingScreen({
  navigation,
}: RootTabScreenProps<"Reading">) {
  const [books, setBooks] = useState<Array<TBook>>([]);
  const route = useRoute();

  const fetchAndSetBooks = async () => {
    const localBooks = await getUnfinishedBooks();
    setBooks(localBooks);
  };

  useEffect(() => {
    fetchAndSetBooks();
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
