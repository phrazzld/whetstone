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

export const AddVocabScreen = () => {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [page, setPage] = useState("");
  const { bookId } = useRoute().params;
  const navigation = useNavigation();

  const addVocab = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot add vocab, user is not logged in.");
    }

    const vocab = {
      type: "vocab",
      word,
      definition,
      bookId,
      page,
      createdAt: new Date(),
    };
    createNote(vocab);
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
        <TextInput
          placeholder="Word"
          style={styles.input}
          value={word}
          onChangeText={setWord}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Definition"
          multiline={true}
          style={styles.multilineInput}
          value={definition}
          onChangeText={setDefinition}
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
          <Button onPress={addVocab} title="Save" />
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
    padding: 10,
    paddingTop: 20,
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
