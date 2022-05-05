import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView, TextInput, View } from "../components/Themed";
import { auth, createNote } from "../firebase";

export const AddNoteScreen = () => {
  const [content, setContent] = useState("");
  const [page, setPage] = useState("");
  const { bookId } = useRoute().params;
  const navigation = useNavigation();

  const addNote = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot add note, user is not logged in.");
    }

    const note = { content, bookId, page, createdAt: new Date() };
    createNote(note);
    navigation.goBack();
  };

  const cancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={[styles.container, { width: "100%" }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />

        <TextInput
          placeholder="Content"
          multiline={true}
          style={styles.multilineInput}
          value={content}
          onChangeText={setContent}
          autoFocus={true}
        />
        <TextInput
          placeholder="Page number"
          style={styles.input}
          value={page}
          onChangeText={setPage}
          keyboardType="numeric"
        />
        <View style={styles.buttonContainer}>
          <Button onPress={addNote} title="Save" />
          <Button onPress={cancel} title="Cancel" color="gray" />
        </View>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    alignItems: "center",
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    width: "90%",
    margin: 10,
  },
  multilineInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 100,
    width: "90%",
    margin: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
