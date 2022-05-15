import { useNavigation } from "@react-navigation/native";
import { Button, SectionList, StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { SafeAreaView, Text, View } from "../components/Themed";
import { useFinishedBooks } from "../hooks/useFinishedBooks";
import { useUnfinishedBooks } from "../hooks/useUnfinishedBooks";

const BooksScreen = () => {
  const unfinishedBooks = useUnfinishedBooks();
  const finishedBooks = useFinishedBooks();
  const navigation = useNavigation();

  const noBooks = unfinishedBooks.length === 0 && finishedBooks.length === 0;

  const renderItem = ({ item }: any) => <Book key={item.id} book={item} />;

  return (
    <SafeAreaView style={styles.container}>
      {noBooks ? (
        <View
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ marginVertical: 20 }}>No books yet.</Text>
          <Button
            title="Add Book"
            onPress={() => navigation.navigate("AddBook")}
          />
        </View>
      ) : (
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
            <View style={{ borderBottomColor: "grey", borderBottomWidth: 1 }}>
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
  },
});

export default BooksScreen;
