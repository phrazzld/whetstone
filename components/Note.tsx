import { StyleSheet } from "react-native";
import { View, Text } from "./Themed";

interface NoteProps {
  note: any;
}

export const Note = (props: BookProps) => {
  const { note } = props;

  return (
    <View style={styles.note}>
      <Text style={styles.content}>{note.content}</Text>
      <Text style={styles.timestamp}>
        {note.createdAt.toDate().toLocaleString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  note: {
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
