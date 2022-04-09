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
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Reading</Text>
        {unfinishedBooks.map((unfinishedBook) => (
          <Book key={unfinishedBook.id} book={unfinishedBook} />
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Finished</Text>
        {finishedBooks.map((finishedBook) => (
          <Book key={finishedBook.id} book={finishedBook} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default BooksScreen;
