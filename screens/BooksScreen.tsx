import { useNavigation } from "@react-navigation/native";
import { Button, SectionList, StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { SafeAreaView, Text, View } from "../components/Themed";
import { useFinishedBooks } from "../hooks/useFinishedBooks";
import { useUnfinishedBooks } from "../hooks/useUnfinishedBooks";
import { TBook } from "../types";

const BooksScreen = () => {
  const unfinishedBooks = useUnfinishedBooks();
  const finishedBooks = useFinishedBooks();
  const navigation = useNavigation();

  const noBooks = unfinishedBooks.length === 0 && finishedBooks.length === 0;

  const listSections = [
    { title: "Reading", data: unfinishedBooks },
    { title: "Finished", data: finishedBooks },
  ];

  const renderItem = ({ item: book }: { item: TBook }) => (
    <Book key={book.id} book={book} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {noBooks ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No books yet.</Text>
          <Button
            title="Add Book"
            onPress={() => navigation.navigate("AddBook")}
          />
        </View>
      ) : (
        <SectionList
          sections={listSections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  sectionHeaderContainer: {
    borderBottomColor: "grey",
    borderBottomWidth: 1,
  },
});

export default BooksScreen;
