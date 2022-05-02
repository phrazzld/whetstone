import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import {
  Button,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { ProgressBar, TextInput } from "react-native-paper";
import { SafeAreaView, Text, View } from "../components/Themed";
import { auth, createBook, storage } from "../firebase";
import { pickImage } from "../utils";
import { useStore } from "../zstore";

const windowWidth = Dimensions.get("window").width;

export const AddBookScreen = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [localImage, setLocalImage] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [creationProgress, setCreationProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const navigation = useNavigation();
  const setStaleBookImage = useStore((state) => state.setStaleBookImage);

  const addBook = async () => {
    if (!auth.currentUser) {
      throw new Error("Cannot add book, user is not logged in.");
    }

    try {
      setProgressText("Saving book details...");
      const book = {
        title,
        author,
        finished: null,
        started: new Date(),
        userId: auth.currentUser.uid,
      };
      const bookRef = await createBook(book);
      const bookId = bookRef.id;

      // Upload image to firebase storage
      if (!!image && !image.cancelled) {
        setProgressText("Uploading book image...");
        const filename = `${auth.currentUser.uid}/${bookId}/cover.jpg`;
        const metadata = { contentType: "image/jpeg" };
        const imgRef = ref(storage, filename);
        const img = await fetch(image.uri);
        const bytes = await img.blob();
        const uploadTask = uploadBytesResumable(imgRef, bytes, metadata);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setCreationProgress(progress * 0.01);
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused": // or 'paused'
                console.log("Upload is paused");
                break;
              case "running": // or 'running'
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            console.log("error:", error);
            setProgressText(`Uh-oh, something went wrong. Error: ${error}`);
          },
          () => {
            setProgressText("Image successfully uploaded.");
            setStaleBookImage(bookId);
            navigation.navigate("Books");
          }
        );
      } else {
        navigation.navigate("Books");
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const cancel = () => {
    navigation.navigate("Books");
  };

  const selectImage = async () => {
    const result = await pickImage();
    setLocalImage(result.uri);
    setImage(result);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={[styles.container, { width: "100%", paddingTop: 20 }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.imageForm}>
          <Image
            source={{ uri: localImage }}
            style={{ width: 180, height: 180, borderRadius: 5 }}
          />
          <Button
            title={localImage ? "Edit image" : "Pick image"}
            onPress={selectImage}
          />
        </View>
        <TextInput
          placeholder="Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          returnKeyType="next"
          autoFocus={true}
        />
        <TextInput
          placeholder="Author"
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
          mode="outlined"
          returnKeyType="done"
        />
        <View style={styles.buttonContainer}>
          <Button onPress={addBook} title="Add Book" />
          <Button onPress={cancel} title="Cancel" color="gray" />
        </View>
        <View style={styles.progressContainer}>
          <ProgressBar
            visible={!!progressText}
            progress={creationProgress}
            style={[styles.progressBar, { width: windowWidth * 0.9 }]}
          />
          {!!progressText && <Text>{progressText}</Text>}
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  input: {
    width: "90%",
    margin: 10,
  },
  progressBar: {
    margin: 10,
    height: 10,
    borderRadius: 10,
  },
  imageForm: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
