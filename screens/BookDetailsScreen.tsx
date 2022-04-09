import { useState } from "react";
import { ActivityIndicator, StyleSheet, Button } from "react-native";
import { Text, View } from "../components/Themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { updateBook, deleteBook, db } from "../firebase";
import { Note } from "../components/Note";
import { useNotes } from "../hooks/useNotes";

export const BookDetailsScreen = () => {
  const { book } = useRoute().params;
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const notes = useNotes(book.id);

  let timeline = `Started: ${book.started.toDate().toLocaleString()}`;
  if (book.finished) {
    timeline += `\nFinished: ${book.finished.toDate().toLocaleString()}`;
  }

  const finishBook = async () => {
    setLoading(true);
    await updateBook(book.id, { finished: new Date() });
    setLoading(false);
    navigation.goBack();
  };

  const removeBook = async () => {
    setLoading(true);
    await deleteBook(book.id);
    setLoading(false);
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        <Text style={[styles.author, { fontSize: 14, marginTop: 10 }]}>
          {timeline}
        </Text>

        <View style={{ marginTop: 20 }}>
          {notes.map((note) => (
            <Note key={note.id} note={note} />
          ))}
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {!book.finished && <Button title="Finish" onPress={finishBook} />}
        <Button title="Delete" onPress={removeBook} color="#cc0000" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
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
