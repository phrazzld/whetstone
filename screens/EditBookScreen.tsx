import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Button,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
import { View } from "../components/Themed";
import { updateBook, auth } from "../firebase";
import { useNavigation, useRoute } from "@react-navigation/native";

export const EditBookScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const book = route.params.book;
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);

  const editBook = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book, user is not logged in.");
    }

    const payload = {
      title,
      author,
    };
    updateBook(book.id, payload);
    navigation.navigate("BookDetails", { book: { ...book, ...payload } });
  };

  const cancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Author"
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
      />
      <View style={styles.buttonContainer}>
        <Button onPress={editBook} title="Edit Book" />
        <Button onPress={cancel} title="Cancel" color="gray" />
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    margin: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    height: 40,
    width: "90%",
    margin: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
