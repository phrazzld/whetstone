import { useNavigation } from "@react-navigation/native";
import { Badge } from "@rneui/themed";
import { useRef } from "react";
import { Alert, Animated, Image, StyleSheet } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { dateLocaleStringOptions, windowWidth } from "../constants";
import Colors, { palette } from "../constants/Colors";
import { deleteNote } from "../firebase";
import useColorScheme from "../hooks/useColorScheme";
import { useNoteImage } from "../hooks/useNoteImage";
import { TNote } from "../types";
import { ensureDate } from "../utils";
import { FontAwesome, Text, View } from "./Themed";

interface NoteProps {
  note: TNote;
  bookId: string;
}

const getNoteType = (
  note: TNote
): "bookmark" | "note" | "vocab" | "started" | "finished" | "shelved" => {
  if (note.type === "note" && !note.content) {
    return "bookmark";
  }
  return note.type;
};

export const Note = (props: NoteProps) => {
  const { note, bookId } = props;
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const image = useNoteImage(bookId, note.id);
  const swipeableRef = useRef<Swipeable | null>(null);

  const editNote = (): void => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    if (note.type === "vocab") {
      navigation.navigate("EditVocab", { bookId, editVocab: note });
    } else if (["started", "finished", "shelved"].includes(note.type)) {
      navigation.navigate("EditDateNote", { bookId, editNote: note });
    } else {
      navigation.navigate("EditNote", { bookId, editNote: note });
    }
  };

  const removeNote = async () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

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
    _x: number,
    _progress: any,
    pressHandler: any
  ): any => {
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          {text === "Delete" ? (
            <FontAwesome name="trash" size={25} color={palette.white} />
          ) : (
            <FontAwesome name="pencil" size={25} color={palette.white} />
          )}
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = (progress: any): any => (
    <View
      style={{
        width: "40%",
        flexDirection: "row",
        height: "100%",
        marginTop: "auto",
        marginBottom: "auto",
      }}
    >
      {renderRightAction("Edit", palette.orange, 128, progress, editNote)}
      {renderRightAction("Delete", palette.red, 64, progress, removeNote)}
    </View>
  );

  // TODO: Refactor this to be more readable
  // Each note type should really be handled on its own
  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      ref={swipeableRef}
    >
      <View
        style={[
          styles.note,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View style={styles.main}>
            <View>
              {!!image && (
                <Image style={styles.image} source={{ uri: image }} />
              )}
            </View>

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
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}
            >
              <NoteTypeBadge noteType={getNoteType(note)} />

              {!!note.page && (
                <View style={{}}>
                  <Text style={[styles.timestamp, { textAlign: "left" }]}>
                    Page {note.page}
                  </Text>
                </View>
              )}

              <View
                style={{
                  display: "flex",
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  marginRight: 10,
                }}
              >
                <FontAwesome
                  name="clock-o"
                  size={15}
                  color={Colors[colorScheme].text}
                  style={{ marginRight: 10 }}
                />
                {["started", "finished", "shelved"].includes(
                  note.type || ""
                ) ? (
                  <Text style={styles.timestamp}>
                    {ensureDate(
                      !!note.date
                        ? note.date
                        : !!note.createdAt
                        ? note.createdAt
                        : new Date()
                    ).toLocaleString([], dateLocaleStringOptions)}
                  </Text>
                ) : (
                  <Text style={styles.timestamp}>
                    {ensureDate(note.createdAt).toLocaleString(
                      [],
                      dateLocaleStringOptions
                    )}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

interface NoteTypeBadgeProps {
  noteType:
    | "bookmark"
    | "vocab"
    | "note"
    | "quote"
    | "started"
    | "finished"
    | "shelved";
}

const NoteTypeBadge = (props: NoteTypeBadgeProps) => {
  const { noteType } = props;
  let icon:
    | "bookmark"
    | "font"
    | "file-text"
    | "quote-left"
    | "play-circle"
    | "check"
    | "pause";

  switch (noteType) {
    case "bookmark":
      icon = "bookmark";
      break;
    case "vocab":
      icon = "font";
      break;
    case "note":
      icon = "file-text";
      break;
    case "quote":
      icon = "quote-left";
      break;
    case "started":
      icon = "play-circle";
      break;
    case "finished":
      icon = "check";
      break;
    case "shelved":
      icon = "pause";
      break;
    default:
      throw new Error(`Unrecognized noteType: ${noteType}`);
  }

  return (
    <Badge
      value={<FontAwesome name={icon} size={15} color={palette.white} />}
      status="primary"
      containerStyle={{ marginRight: 10 }}
      badgeStyle={{
        height: 30,
        borderRadius: 20,
        width: 30,
      }}
    />
  );
};

const styles = StyleSheet.create({
  main: {
    width: "100%",
  },
  note: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopColor: palette.grey,
    borderTopWidth: 1,
  },
  timestamp: {
    fontSize: 11,
    paddingHorizontal: 10,
  },
  content: {
    fontSize: 14,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  word: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  definition: {
    fontSize: 14,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  noteTypeContainer: {
    marginRight: 15,
    width: "15%",
    borderRadius: 5,
    borderColor: palette.grey,
    borderWidth: 1,
    marginHorizontal: 10,
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
    color: palette.white,
    backgroundColor: "transparent",
    padding: 10,
    fontSize: 15,
    fontWeight: "500",
  },
  image: {
    width: windowWidth,
    height: windowWidth,
    resizeMode: "cover",
  },
});
