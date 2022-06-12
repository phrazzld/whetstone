import { useNavigation, useRoute } from "@react-navigation/native";
import { Tab, TabView } from "@rneui/themed";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { SafeAreaView, Text, View } from "../components/Themed";
import { TABS } from "../constants";
import { useFinishedBooks } from "../hooks/useFinishedBooks";
import { useUnfinishedBooks } from "../hooks/useUnfinishedBooks";
import { useUnreadBooks } from "../hooks/useUnreadBooks";
import { BooksScreenParams, TBook } from "../types";

const BooksScreen = () => {
  const route = useRoute();
  const params: BooksScreenParams | null = route.params || null;
  const tab = params?.tab || TABS.READING;
  const [tabIndex, setTabIndex] = useState(tab);
  const unfinishedBooks = useUnfinishedBooks();
  const finishedBooks = useFinishedBooks();
  const unreadBooks = useUnreadBooks();
  const navigation = useNavigation();

  useEffect(() => {
    if (tab !== null) {
      setTabIndex(tab);
    }
  }, [tab]);

  const noBooks =
    unreadBooks.length === 0 &&
    unfinishedBooks.length === 0 &&
    finishedBooks.length === 0;

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
        <>
          <Tab
            value={tabIndex}
            onChange={(e) => setTabIndex(e)}
            indicatorStyle={{ backgroundColor: "transparent" }}
            variant="primary"
          >
            <Tab.Item title="Reading" />
            <Tab.Item title="Finished" />
            <Tab.Item title="Unread" />
          </Tab>

          <TabView value={tabIndex} onChange={setTabIndex} disableSwipe={true}>
            <TabView.Item style={{ width: "100%" }}>
              <FlatList
                data={unfinishedBooks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </TabView.Item>
            <TabView.Item style={{ width: "100%" }}>
              <FlatList
                data={finishedBooks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </TabView.Item>
            <TabView.Item style={{ width: "100%" }}>
              <FlatList
                data={unreadBooks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </TabView.Item>
          </TabView>
        </>
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
