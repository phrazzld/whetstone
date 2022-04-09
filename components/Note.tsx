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
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            marginRight: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="bookmark-o" size={24} color="#555" />
          <Text>{note.page}</Text>
        </View>
        <View style={styles.main}>
          <Text style={styles.content}>{note.content}</Text>
          <Text style={styles.timestamp}>
            {note.createdAt.toDate().toLocaleString()}
          </Text>
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
    width: "12%",
    alignItems: "center",
    justifyContent: "center",
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
