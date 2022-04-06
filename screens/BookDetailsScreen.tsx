import { useState } from "react";
import { ActivityIndicator, StyleSheet, Button } from "react-native";
import { Text, View } from "../components/Themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { updateBook, deleteBook } from "../firebase";

interface BookDetailsScreenProps {}

export const BookDetailsScreen = (props: BookDetailsScreenProps) => {
  const { book } = useRoute().params;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  console.log("BookDetails :: book:", book);

  const finishBook = async () => {
    setLoading(true);
    await updateBook(book.id, { finished: new Date() });
    setLoading(false);
    navigation.navigate("Journey");
  };

  const removeBook = async () => {
    setLoading(true);
    await deleteBook(book.id);
    setLoading(false);
    navigation.navigate("Reading");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#cc0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>
      {!book.finished && <Button title="Finish" onPress={finishBook} />}
      <Button title="Delete" onPress={removeBook} color="#cc0000" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  author: {
    fontSize: 16,
    color: "grey",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
