import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextField } from "../components/TextField";
import { SafeAreaView, View } from "../components/Themed";
import { palette } from "../constants/Colors";
import { auth, createNote, updateNote } from "../firebase";
import { EditNoteScreenParams, NotePayload } from "../types";
import { strToInt } from "../utils";

export const EditNoteScreen = () => {
  const route = useRoute();
  const params: EditNoteScreenParams | null = route.params || null;
  const [content, setContent] = useState(params?.editNote?.content || "");
  const [page, setPage] = useState(params?.editNote?.page?.toString() || "");
  const navigation = useNavigation();

  const addNote = () => {
    if (!params?.bookId) {
      throw new Error("Cannot add note, invalid route params");
    }

    const note: NotePayload = {
      type: "note",
      content,
      page: strToInt(page),
      createdAt: new Date(),
    };
    if (!!content || !!page) {
      createNote(params.bookId, note);
    }
    navigation.goBack();
  };

  const modifyNote = () => {
    if (!params?.bookId || !params.editNote) {
      throw new Error("Cannot modify note, invalid route params");
    }

    const payload: NotePayload = {
      type: "note",
      content,
      page: strToInt(page),
      updatedAt: new Date(),
    };
    if (!!content || !!page) {
      updateNote(params.bookId, params.editNote.id, payload);
    }
    navigation.goBack();
  };

  const save = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot save note, user is not logged in.");
    }

    if (params?.editNote) {
      modifyNote();
    } else {
      addNote();
    }
  };

  const cancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ alignItems: "center", flex: 1 }}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <TextField
          label="Content"
          multiline={true}
          text={content}
          onChangeText={setContent}
          autoCapitalize="sentences"
          returnKeyType="default"
        />
        <TextField
          label="Page number"
          text={page}
          onChangeText={setPage}
          keyboardType="numeric"
          returnKeyType="done"
        />
        <View style={styles.buttonContainer}>
          <Button onPress={save} title="Save" />
          <Button onPress={cancel} title="Cancel" color={palette.grey} />
        </View>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    margin: 10,
    width: "90%",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
