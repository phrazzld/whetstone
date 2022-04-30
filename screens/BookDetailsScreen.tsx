import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Button,
} from "react-native";
import { Text, View } from "../components/Themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth, storage, updateBook, deleteBook } from "../firebase";
import { Note } from "../components/Note";
import { useNotes } from "../hooks/useNotes";
import { ref, deleteObject } from "firebase/storage";
import { useBookImage } from "../hooks/useBookImage";

export const BookDetailsScreen = () => {
  const { book } = useRoute().params;
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const navigation = useNavigation();
  const notes = useNotes(book.id);
  const image = useBookImage(book.id, true);

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
    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!auth.currentUser) {
              throw new Error("Can't delete this book, no user is logged in.");
            }

            setLoading(true);
            await deleteBook(book.id);
            const bookImageRef = ref(
              storage,
              `${auth.currentUser.uid}/${book.id}/cover.jpg`
            );
            deleteObject(bookImageRef)
              .then(() => {
                setLoading(false);
                navigation.goBack();
              })
              .catch((err) => {
                console.log("Error deleting book image:", err);
                setLoading(false);
                navigation.goBack();
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const editBook = () => {
    navigation.navigate("EditBook", { book });
  };

  const selectNote = (id: string): void => {
    if (selectedNote === id) {
      setSelectedNote("");
    } else {
      setSelectedNote(id);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ marginRight: 10 }}>
              {!!image ? (
                <Image style={styles.image} source={{ uri: image }} />
              ) : (
                <View style={styles.image}></View>
              )}
            </View>
            <View>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>
              <Text style={[styles.author, { fontSize: 12, marginTop: 10 }]}>
                {timeline}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginVertical: 10,
            }}
          >
            {!book.finished && <Button title="Finish" onPress={finishBook} />}
            <Button title="Edit" onPress={editBook} />
            <Button title="Delete" onPress={removeBook} color="#cc0000" />
          </View>

          <View>
            {notes.map((note) => (
              <Note
                key={note.id}
                note={note}
                selected={selectedNote === note.id}
                onPress={selectNote}
              />
            ))}
          </View>

          {notes.length === 0 && (
            <View>
              <Text style={{ marginVertical: 20, textAlign: "center" }}>
                No notes yet.
              </Text>
              <Button
                title="Add Note"
                onPress={() =>
                  navigation.navigate("AddNote", { bookId: book.id })
                }
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  author: {
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    height: 90,
    width: 60,
    borderRadius: 10,
  },
});
