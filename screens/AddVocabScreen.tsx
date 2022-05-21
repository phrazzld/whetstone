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
import { auth, createNote, updateNote } from "../firebase";

interface DictionaryDefinition {
  definition: string;
  example: string;
  synonyms: Array<string>;
  antonyms: Array<string>;
}

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: Array<DictionaryDefinition>;
}

interface DictionaryWord {
  word: string;
  origin: string;
  meanings: Array<DictionaryMeaning>;
}

export const AddVocabScreen = () => {
  const { bookId, editVocab } = useRoute().params;
  const [word, setWord] = useState(editVocab?.word);
  const [definition, setDefinition] = useState(editVocab?.definition);
  const [page, setPage] = useState(editVocab?.page);
  const navigation = useNavigation();

  const addVocab = (): void => {
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

  const modifyVocab = () => {
    const payload = {
      type: "vocab",
      word,
      definition,
      page,
      updatedAt: new Date(),
    };
    updateNote(bookId, editVocab.id, payload);
    navigation.goBack();
  };

  const save = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot save note, user is not logged in.");
    }

    if (editVocab) {
      modifyVocab();
    } else {
      addVocab();
    }
  };

  const cancel = (): void => {
    navigation.goBack();
  };

  const getDefinition = async (): Promise<void> => {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    const defs: Array<DictionaryWord> = await res.json();

    if (defs.length > 0 && defs[0].meanings.length > 0) {
      if (defs[0].meanings.length === 1) {
        setDefinition(defs[0].meanings[0].definitions[0].definition);
      } else {
        let def = "";
        for (let i = 0; i < defs[0].meanings.length; i++) {
          def += `${i + 1}. ${defs[0].meanings[i].definitions[0].definition}`;
          if (i !== defs[0].meanings.length - 1) {
            def += "\n";
          }
        }

        setDefinition(def);
      }
    }
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
          autoFocus={true}
        />
        <TextInput
          placeholder="Definition"
          multiline={true}
          style={styles.multilineInput}
          value={definition}
          onChangeText={setDefinition}
          onFocus={getDefinition}
        />
        <TextInput
          placeholder="Page number"
          style={styles.input}
          value={page}
          onChangeText={setPage}
          keyboardType="numeric"
        />
        <View style={styles.buttonContainer}>
          <Button onPress={save} title="Save" />
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
