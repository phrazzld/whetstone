import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import { deleteNote } from "../firebase";
import useColorScheme from "../hooks/useColorScheme";
import { dateLocaleStringOptions } from "../utils";
import { FontAwesome, Text, View } from "./Themed";

interface NoteProps {
  note: any;
  selected: boolean;
  onPress: (id: string) => void;
}

export const Note = (props: NoteProps) => {
  const { note, selected, onPress } = props;
  const colorScheme = useColorScheme();

  const removeNote = async () => {
    // Ask user to confirm deletion
    Alert.alert("Delete Note?", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Delete note from database
          await deleteNote(note.id);
        },
      },
    ]);
  };

  return (
    <TouchableOpacity onPress={() => onPress(note.id)} style={styles.note}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        <View style={styles.main}>
          {!!note.content && <Text style={styles.content}>{note.content}</Text>}

          {note.type === "vocab" && (
            <>
              <Text style={styles.word}>{note.word}</Text>
              <Text style={styles.definition}>{note.definition}</Text>
            </>
          )}

          <View
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={styles.noteTypeContainer}>
              <Text style={styles.noteType}>{note.type || "note"}</Text>
            </View>
            <View
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <FontAwesome
                name="clock-o"
                size={15}
                color={Colors[colorScheme].text}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.timestamp}>
                {note.createdAt
                  .toDate()
                  .toLocaleString([], dateLocaleStringOptions)}
              </Text>
            </View>

            {!!note.page && (
              <View style={{ display: "flex", flex: 1, flexDirection: "row" }}>
                <FontAwesome
                  name="sticky-note-o"
                  size={15}
                  color={Colors[colorScheme].text}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.timestamp}>Page {note.page}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {selected && (
          <TouchableOpacity onPress={removeNote}>
            <FontAwesome name="trash" size={24} color="#cc0000" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actions: {
    width: "5%",
    alignItems: "center",
    justifyContent: "center",
  },
  main: {
    width: "95%",
  },
  note: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    paddingTop: 20,
    borderTopColor: "grey",
    borderTopWidth: 1,
  },
  timestamp: {
    fontSize: 11,
  },
  content: {
    fontSize: 14,
    marginBottom: 10,
  },
  word: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 5,
  },
  definition: {
    fontSize: 14,
    marginBottom: 10,
  },
  noteTypeContainer: {
    marginRight: 15,
    width: "12%",
    borderRadius: 5,
    borderColor: "grey",
    borderWidth: 1,
    paddingVertical: 3,
  },
  noteType: {
    fontSize: 11,
    textAlign: "center",
  },
});
