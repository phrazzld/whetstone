import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  Image,
  Dimensions,
  Button,
  Platform,
  StyleSheet,
} from "react-native";
import { View, Text } from "../components/Themed";
import { storage, updateBook, auth } from "../firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { ProgressBar, TextInput } from "react-native-paper";
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
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const cancel = () => {
    navigation.navigate("BookDetails", { book });
  };

  const pickImage = async () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book image, user is not logged in.");
    }

    try {
      // Check media permissions
      const permissions = await ImagePicker.getMediaLibraryPermissionsAsync();

      // If media permissions are not granted, request permissions
      if (permissions.granted === false) {
        const newPermissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

        // If media permissions are still not granted, return
        if (newPermissions.granted === false) {
          throw new Error("Media permissions not granted.");
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [6, 9],
        quality: 1,
      });
      // TODO: handle cancel case here instead of on save
      setLocalImage(result.uri);
      setImage(result);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <View style={styles.imageForm}>
        <Image
          source={{ uri: localImage }}
          style={{ width: 120, height: 180, borderRadius: 10 }}
        />
        <Button
          title={localImage ? "Edit image" : "Pick image"}
          onPress={pickImage}
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
      />
      <TextInput
        mode="outlined"
        label="Author"
        placeholder="Author"
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
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
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
