import { StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { Text, View } from "../components/Themed";
import { useUnfinishedBooks } from "../hooks/useUnfinishedBooks";
import { useFinishedBooks } from "../hooks/useFinishedBooks";

const BooksScreen = () => {
  const unfinishedBooks = useUnfinishedBooks();
  const finishedBooks = useFinishedBooks();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Reading</Text>
      {unfinishedBooks.map((unfinishedBook) => (
        <Book key={unfinishedBook.id} book={unfinishedBook} />
      ))}

      <Text style={styles.sectionHeader}>Read</Text>
      {finishedBooks.map((finishedBook) => (
        <Book key={finishedBook.id} book={finishedBook} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: "600",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});

export default BooksScreen;
