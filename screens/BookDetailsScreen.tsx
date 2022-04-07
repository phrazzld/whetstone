import { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Button } from "react-native";
import { Text, View } from "../components/Themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getBookNotes, updateBook, deleteBook, db } from "../firebase";
import {
  orderBy,
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";

interface BookDetailsScreenProps {}

export const BookDetailsScreen = (props: BookDetailsScreenProps) => {
  const { book } = useRoute().params;
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Array<any>>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const notesQuery = query(
      collection(db, "notes"),
      where("bookId", "==", book.id),
      orderBy("createdAt", "desc")
    );
    const observer = onSnapshot(notesQuery, (snapshot) => {
      let localNotes: Array<any> = [];
      snapshot.forEach((s) => {
        localNotes.push({ id: s.id, ...s.data() });
      });
      setNotes(localNotes);
    });

    return () => {
      observer();
    };
  }, []);

  const finishBook = async () => {
    setLoading(true);
    await updateBook(book.id, { finished: new Date() });
    setLoading(false);
    navigation.navigate("JourneyStack");
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
      <View>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        {notes.map((note) => (
          <View key={note.id}>
            <Text key={note.id} style={styles.note}>
              {note.content}
            </Text>
            <Text>{note.createdAt.toDate().toLocaleString()}</Text>
          </View>
        ))}
        <Button
          title="Add Note"
          onPress={() => navigation.navigate("AddNote", { bookId: book.id })}
        />
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
  note: {
    fontSize: 14,
    color: "grey",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
