import { useState } from "react";
import { ActivityIndicator, StyleSheet, Button } from "react-native";
import { Text, View } from "../components/Themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { deleteBook } from "../firebase";

interface BookDetailsScreenProps {}

export const BookDetailsScreen = (props: BookDetailsScreenProps) => {
  const { book } = useRoute().params;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  console.log("book:", book);

  const removeBook = async () => {
    setLoading(true);
    await deleteBook(book.id);
    setLoading(false);
    navigation.navigate("Reading", { refetchBooks: true });
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
