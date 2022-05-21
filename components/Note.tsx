import { Alert, Animated, StyleSheet } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "../constants/Colors";
import { deleteNote } from "../firebase";
import useColorScheme from "../hooks/useColorScheme";
import { TNote } from "../types";
import { dateLocaleStringOptions } from "../utils";
import { FontAwesome, Text, View } from "./Themed";

interface NoteProps {
  note: TNote;
  bookId: string;
}

export const Note = (props: NoteProps) => {
  const { note, bookId, onPress } = props;
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
          await deleteNote(bookId, note.id);
        },
      },
    ]);
  };

  const renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: any
  ): any => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={removeNote}
        >
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = (progress: any): any => (
    <View
      style={{
        width: "20%",
        flexDirection: "row",
        height: "100%",
        marginTop: "auto",
        marginBottom: "auto",
      }}
    >
      {renderRightAction("Delete", "red", 64, progress)}
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <View
        style={[
          styles.note,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View style={styles.main}>
            {!!note.content && (
              <Text style={styles.content}>{note.content}</Text>
            )}

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
                <View
                  style={{ display: "flex", flex: 1, flexDirection: "row" }}
                >
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
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  main: {
    width: "100%",
  },
  note: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderTopColor: "grey",
    borderTopWidth: 1,
    paddingHorizontal: 10,
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
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  actionText: {
    color: "white",
    backgroundColor: "transparent",
    padding: 10,
  },
});
