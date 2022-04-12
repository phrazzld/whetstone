import { SafeAreaView, SectionList, StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { Text } from "../components/Themed";
import { useUnfinishedBooks } from "../hooks/useUnfinishedBooks";
import { useFinishedBooks } from "../hooks/useFinishedBooks";

const BooksScreen = () => {
  const unfinishedBooks = useUnfinishedBooks();
  const finishedBooks = useFinishedBooks();

  const renderItem = ({ item }: any) => <Book key={item.id} book={item} />;

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={[
          {
            title: "Reading",
            data: unfinishedBooks,
          },
          {
            title: "Finished",
            data: finishedBooks,
          },
        ]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 10,
  },
});

export default BooksScreen;
