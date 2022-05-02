import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
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
import { auth, storage, updateBook } from "../firebase";
import { pickImage } from "../utils";
import { useStore } from "../zstore";

const windowWidth = Dimensions.get("window").width;

export const EditBookScreen = () => {
  const navigation = useNavigation();
  const { book } = useRoute().params;
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [localImage, setLocalImage] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [showImageUploadProgress, setShowImageUploadProgress] = useState(false);
  const setStaleBookImage = useStore((state) => state.setStaleBookImage);

  const getImage = async () => {
    if (!auth.currentUser) {
      throw new Error("Not logged in");
    }

    const coverRef = ref(
      storage,
      `${auth.currentUser.uid}/${book.id}/cover.jpg`
    );
    const coverUrl = await getDownloadURL(coverRef);
    if (coverUrl) {
      setLocalImage(coverUrl);
    }
  };

  useEffect(() => {
    getImage();
  }, []);

  const saveChanges = async () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book, user is not logged in.");
    }

    try {
      const payload = {
        title,
        author,
      };
      await updateBook(book.id, payload);

      if (!!image && !image.cancelled) {
        setShowImageUploadProgress(true);
        const filename = `${auth.currentUser.uid}/${book.id}/cover.jpg`;
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
            setStaleBookImage(book.id);
            navigation.navigate("BookDetails", {
              book: { ...book, ...payload },
            });
          }
        );
      } else {
        navigation.navigate("BookDetails", {
          book: { ...book, ...payload },
        });
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const cancel = () => {
    navigation.navigate("BookDetails", { book });
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
        <View></View>
        <TextInput
          mode="outlined"
          label="Title"
          placeholder="Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
        />
        <TextInput
          mode="outlined"
          label="Author"
          placeholder="Author"
          style={styles.input}
          value={author}
          onChangeText={setAuthor}
          returnKeyType="done"
        />
        <View style={styles.buttonContainer}>
          <Button onPress={saveChanges} title="Save" />
          <Button onPress={cancel} title="Cancel" color="gray" />
        </View>
        <View style={styles.progressContainer}>
          <ProgressBar
            visible={showImageUploadProgress}
            progress={imageUploadProgress}
            style={[styles.progressBar, { width: windowWidth * 0.9 }]}
          />
          {showImageUploadProgress && (
            <Text>
              {imageUploadProgress === 1
                ? "Image successfully uploaded."
                : "Uploading image..."}
            </Text>
          )}
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
  imageForm: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {},
});
