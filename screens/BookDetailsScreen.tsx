import { useNavigation, useRoute } from "@react-navigation/native";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Note } from "../components/Note";
import { Text, View } from "../components/Themed";
import { auth, deleteBook, storage, updateBook } from "../firebase";
import { useBookImage } from "../hooks/useBookImage";
import { useNotes } from "../hooks/useNotes";
import { dateLocaleStringOptions } from "../utils";
import { useStore } from "../zstore";

const windowWidth = Dimensions.get("window").width;

interface ActionMenuItemProps {
  text: string;
  onPress: () => void;
  destructive: boolean;
}

const ActionMenuItem = (props: ActionMenuItemProps) => {
  const { text, onPress, destructive } = props;

  const color = destructive ? "#cc0000" : "#147efb";

  return (
    <View
      style={
        destructive ? {} : { borderBottomWidth: 1, borderBottomColor: "grey" }
      }
    >
      <TouchableOpacity
        style={{ padding: 10, paddingLeft: 15, paddingRight: 15 }}
        onPress={onPress}
      >
        <Text style={{ fontSize: 18, textAlign: "left", color: color }}>
          {text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const BookDetailsScreen = () => {
  const { book } = useRoute().params;
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const navigation = useNavigation();
  const notes = useNotes(book.id);
  const image = useBookImage(book.id, true);
  const showActionMenu = useStore((state) => state.showActionMenu);
  const setShowActionMenu = useStore((state) => state.setShowActionMenu);

  const startDate =
    book.started instanceof Date
      ? book.started.toLocaleString([], dateLocaleStringOptions)
      : book.started.toDate().toLocaleString([], dateLocaleStringOptions);

  const finishDate = book.finished
    ? book.finished instanceof Date
      ? book.finished.toLocaleString([], dateLocaleStringOptions)
      : book.finished.toDate().toLocaleString([], dateLocaleStringOptions)
    : null;

  const timeline = book.finished
    ? startDate.concat(" - ").concat(finishDate)
    : `Started: ${startDate}`;

  const finishBook = async (): Promise<void> => {
    setShowActionMenu(false);
    setLoading(true);
    await updateBook(book.id, { finished: new Date() });
    setLoading(false);
    navigation.goBack();
  };

  const removeBook = async (): Promise<void> => {
    setShowActionMenu(false);
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

  const editBook = (): void => {
    setShowActionMenu(false);
    navigation.navigate("EditBook", { book });
  };

  const addNote = (): void => {
    setShowActionMenu(false);
    navigation.navigate("AddNote", { bookId: book.id });
  };

  const addVocab = (): void => {
    setShowActionMenu(false);
    navigation.navigate("AddVocab", { bookId: book.id });
  };

  const selectNote = (id: string): void => {
    if (selectedNote === id) {
      setSelectedNote("");
    } else {
      setSelectedNote(id);
    }
  };

  const ActionMenu = () => {
    return (
      <View
        style={{
          position: "absolute",
          right: 30,
          top: 0,
          borderColor: "grey",
          borderWidth: 2,
          borderRadius: 5,
        }}
      >
        <ActionMenuItem text="Edit" onPress={editBook} />
        {!book.finished && (
          <ActionMenuItem text="Finish" onPress={finishBook} />
        )}
        <ActionMenuItem text="Delete" onPress={removeBook} destructive />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ height: "100%" }}>
      <ScrollView>
        <View style={styles.container}>
          <View>
            <View style={{ marginRight: 10 }}>
              {!!image ? (
                <Image
                  style={{
                    width: windowWidth,
                    height: windowWidth,
                  }}
                  source={{ uri: image }}
                />
              ) : (
                <View
                  style={{ width: windowWidth, height: windowWidth }}
                ></View>
              )}
              <View
                style={{
                  margin: 5,
                  padding: 5,
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottomColor: "grey",
                  borderBottomWidth: 1,
                }}
              >
                <Text style={styles.title}>{book.title}</Text>
                <Text style={styles.author}>{book.author}</Text>
                <Text style={[styles.author, { fontSize: 12, marginTop: 10 }]}>
                  {timeline}
                </Text>
              </View>
            </View>

            <View>
              <View
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                }}
              >
                <Button title="Add Note" onPress={addNote} />
                <Button title="Add Vocab" onPress={addVocab} />
              </View>
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
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {showActionMenu && <ActionMenu />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  author: {
    fontSize: 16,
    paddingBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    paddingBottom: 5,
  },
});
