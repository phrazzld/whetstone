import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Dimensions,
  Button,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
import { View, Text } from "../components/Themed";
import { storage, updateBook, auth } from "../firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { ProgressBar } from "react-native-paper";
import { useStore } from "../zstore";

const windowWidth = Dimensions.get("window").width;

export const EditBookScreen = () => {
  const navigation = useNavigation();
  const { book } = useRoute().params;
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [refreshImage, setRefreshImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [showImageUploadProgress, setShowImageUploadProgress] = useState(false);
  const setStaleBookImage = useStore((state) => state.setStaleBookImage);

  const editBook = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book, user is not logged in.");
    }

    const payload = {
      title,
      author,
    };
    updateBook(book.id, payload);
    navigation.navigate("BookDetails", {
      book: { ...book, ...payload },
    });
  };

  const cancel = () => {
    navigation.navigate("BookDetails", { book });
  };

  const pickImage = async () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book image, user is not logged in.");
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        setShowImageUploadProgress(true);
        const filename = `${auth.currentUser.uid}/${book.id}/cover.jpg`;
        const metadata = { contentType: "image/jpeg" };
        const imgRef = ref(storage, filename);
        const img = await fetch(result.uri);
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
            setImageUploadProgress(progress * 0.01);
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
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log("downloadURL:", downloadURL);
            });
            setStaleBookImage(book.id);
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <Button title="Edit image" onPress={pickImage} />
      <ProgressBar
        visible={showImageUploadProgress}
        progress={imageUploadProgress}
        style={[styles.progressBar, { width: windowWidth * 0.9 }]}
      />
      <View>
        {imageUploadProgress === 1 && <Text>Image successfully uploaded!</Text>}
      </View>
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
        <Button onPress={editBook} title="Save" />
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
  progressBar: {
    margin: 10,
    height: 10,
    borderRadius: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
