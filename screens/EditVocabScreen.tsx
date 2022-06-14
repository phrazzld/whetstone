import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { TextField } from "../components/TextField";
import { SafeAreaView, View } from "../components/Themed";
import { auth, createNote, updateNote } from "../firebase";
import { EditNoteScreenParams, VocabPayload } from "../types";
import { strToInt } from "../utils";

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

export const EditVocabScreen = () => {
  const route = useRoute();
  const params: EditNoteScreenParams | null = route.params || null;
  const [word, setWord] = useState(params?.editVocab?.word || "");
  const [definition, setDefinition] = useState(
    params?.editVocab?.definition || ""
  );
  const [page, setPage] = useState(params?.editVocab?.page?.toString() || "");
  const navigation = useNavigation();

  const addVocab = (): void => {
    if (!params?.bookId) {
      throw new Error("Cannot add vocab, invalid route params");
    }

    const vocab: VocabPayload = {
      type: "vocab",
      word,
      definition,
      page: strToInt(page),
      createdAt: new Date(),
    };
    createNote(params.bookId, vocab);
    navigation.goBack();
  };

  const modifyVocab = () => {
    if (!params?.bookId || !params.editVocab) {
      throw new Error("Cannot modify vocab, invalid route params");
    }

    const payload: VocabPayload = {
      type: "vocab",
      word,
      definition,
      page: strToInt(page),
      updatedAt: new Date(),
    };
    updateNote(params.bookId, params.editVocab.id, payload);
    navigation.goBack();
  };

  const save = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot save note, user is not logged in.");
    }

    if (params?.editVocab) {
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
        <TextField
          label="Word"
          text={word}
          onChangeText={setWord}
          autoCapitalize="none"
        />
        <TextField
          label="Definition"
          multiline={true}
          text={definition}
          onChangeText={setDefinition}
          onFocus={getDefinition}
          autoCapitalize="sentences"
        />
        <TextField
          label="Page number"
          text={page}
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
