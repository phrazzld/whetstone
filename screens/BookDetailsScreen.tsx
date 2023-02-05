import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Note } from "../components/Note";
import { Text, View } from "../components/Themed";
import { palette } from "../constants/Colors";
import { useBookImage } from "../hooks/useBookImage";
import { useNotes } from "../hooks/useNotes";
import { BookDetailsScreenRouteProp, TNote } from "../types";
import { formatReadDates } from "../utils";

const windowWidth = Dimensions.get("window").width;

type NotesProps = {
  bookId: string;
  notes: Array<TNote>;
  loading: boolean;
};

const Notes = (props: NotesProps) => {
  const { bookId, notes, loading } = props;

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <>
      {notes.map((note: TNote) => (
        <Note key={note.id} note={note} bookId={bookId} />
      ))}

      {notes.length === 0 && (
        <View>
          <Text style={{ marginVertical: 20, textAlign: "center" }}>
            No notes yet.
          </Text>
        </View>
      )}
    </>
  );
};

export const BookDetailsScreen = () => {
  const route = useRoute<BookDetailsScreenRouteProp>();
  const params = route.params;
  const { book } = params;
  const navigation = useNavigation();
  const { data: notes, loading } = useNotes(book.id);
  const image = useBookImage(book.id, true);

  const addNote = (): void => {
    navigation.navigate("AddNote", { bookId: book.id });
  };

  const addVocab = (): void => {
    navigation.navigate("AddVocab", { bookId: book.id });
  };

  const addDateNote = (): void => {
    navigation.navigate("AddDateNote", { bookId: book.id });
  };

  return (
    <View style={{ height: "100%" }}>
      <ScrollView>
        <View style={styles.container}>
          <View>
            <View>
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
                  padding: 10,
                  marginBottom: 10,
                  borderBottomColor: palette.grey,
                  borderBottomWidth: 1,
                }}
              >
                <Text style={styles.title}>{book.title}</Text>
                <Text style={styles.author}>{book.author}</Text>
                <Text style={[styles.author, { fontSize: 12, marginTop: 10 }]}>
                  {formatReadDates(book)}
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
                  paddingBottom: 10,
                }}
              >
                <Button title="Add Note" onPress={addNote} />
                <Button title="Add Vocab" onPress={addVocab} />
                <Button title="Add Date" onPress={addDateNote} />
              </View>
              <Notes bookId={book.id} notes={notes} loading={loading} />
            </View>
          </View>
        </View>
      </ScrollView>
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
