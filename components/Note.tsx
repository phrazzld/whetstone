import { FontAwesome } from "@expo/vector-icons";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "./Themed";
import { deleteNote } from "../firebase";

interface NoteProps {
  note: any;
  selected: boolean;
  onPress: (id: string) => void;
}

export const Note = (props: NoteProps) => {
  const { note, selected, onPress } = props;

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
      <View style={styles.main}>
        <Text style={styles.content}>{note.content}</Text>
        <Text style={styles.timestamp}>
          {note.createdAt.toDate().toLocaleString()}
        </Text>
      </View>
      <View style={styles.actions}>
        {selected && (
          <FontAwesome.Button
            name="trash"
            onPress={removeNote}
            color="#cc0000"
            backgroundColor="transparent"
            style={{ alignItems: "center" }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actions: {
    width: "12%",
    alignItems: "center",
  },
  main: {
    width: "80%",
  },
  note: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "white",
  },
  timestamp: {
    fontSize: 12,
    color: "grey",
  },
  content: {
    fontSize: 18,
  },
});
