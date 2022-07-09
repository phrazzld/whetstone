import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import { Button, Image, Platform, StyleSheet, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ProgressBar } from "react-native-paper";
import uuid from "react-native-uuid";
import { TextField } from "../components/TextField";
import { SafeAreaView, View } from "../components/Themed";
import { windowWidth } from "../constants";
import { palette } from "../constants/Colors";
import { auth, createNote, storage, updateNote } from "../firebase";
import { addLocalNote, queueAction } from "../local-storage";
import { EditNoteScreenParams, NotePayload } from "../types";
import { strToInt, takePhoto } from "../utils";
import { useStore } from "../zstore";

export const EditNoteScreen = () => {
  const route = useRoute();
  const params: EditNoteScreenParams | null = route.params || null;
  const [content, setContent] = useState(params?.editNote?.content || "");
  const [page, setPage] = useState(params?.editNote?.page?.toString() || "");
  const navigation = useNavigation();
  const [localImage, setLocalImage] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [creationProgress, setCreationProgress] = useState(0);
  const setStaleNoteImage = useStore((state) => state.setStaleNoteImage);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [error, setError] = useState("");
  const netInfo = useNetInfo();

  const getImage = async () => {
    if (!auth.currentUser) {
      throw new Error("Not logged in");
    }

    const coverRef = ref(
      storage,
      `${auth.currentUser.uid}/${params?.bookId}/${params?.editNote?.id}.jpg`
    );
    const coverUrl = await getDownloadURL(coverRef);
    if (coverUrl) {
      setLocalImage(coverUrl);
    }
  };

  useEffect(() => {
    if (params?.editNote) {
      getImage();
    }
  }, [params]);

  // TODO: Separate app handling logic from actual image upload logic
  // TODO: Define offline action handler for image upload
  // NOTE: Do we want to keep images in local storage? Or is that too heavy?
  const uploadImage = async (
    image: any,
    bookId: string,
    noteId: string
  ): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit note, user is not logged in.");
    }

    if (!!image && !image.cancelled) {
      const filename = `${auth.currentUser.uid}/${bookId}/${noteId}.jpg`;
      const metadata = { contentType: "image/jpeg" };
      const imgRef = ref(storage, filename);
      const img = await fetch(image.uri);
      const bytes = await img.blob();
      const uploadTask = uploadBytesResumable(imgRef, bytes, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot: any) => {
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
            default:
              console.log(`Upload is ${snapshot.state}`);
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          console.log("error:", error);
        },
        () => {
          setStaleNoteImage(noteId);
          navigation.goBack();
        }
      );
    } else {
      navigation.goBack();
    }
  };

  const selectImage = async () => {
    const result = await takePhoto();
    if (!result.cancelled) {
      setLocalImage(result.uri);
      setImage(result);
    }
  };

  const addNote = async (): Promise<void> => {
    if (!params?.bookId) {
      throw new Error("Cannot add note, invalid route params");
    }

    const note: NotePayload = {
      type: "note",
      content,
      page: strToInt(page),
      createdAt: new Date(),
    };
    if (!content && !page) {
      setError("Note must have content or page.");
      return;
    }

    if (netInfo.isConnected) {
      const noteRef = await createNote(params.bookId, note);
      const noteId = noteRef.id;
      setCreationProgress(0.01);
      uploadImage(image, params.bookId, noteId);
    } else {
      // If we're offline, add the note to local storage
      await addLocalNote(params.bookId, {
        ...note,
        id: uuid.v4().toString(),
        createdAt: new Date(),
      });

      // And queue a Firebase create action for when we come back online
      await queueAction("create note", { id: params.bookId, body: note });

      navigation.goBack();
    }
  };

  const modifyNote = async (): Promise<void> => {
    if (!params?.bookId || !params.editNote) {
      throw new Error("Cannot modify note, invalid route params");
    }

    const payload: NotePayload = {
      type: "note",
      content,
      page: strToInt(page),
      updatedAt: new Date(),
    };

    if (!content && !page) {
      setError("Note must have content or page.");
      return;
    }

    await updateNote(params.bookId, params.editNote.id, payload);
    uploadImage(image, params.bookId, params.editNote.id);
  };

  const save = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot save note, user is not logged in.");
    }

    setSaveDisabled(true);

    if (params?.editNote) {
      modifyNote();
    } else {
      addNote();
    }
  };

  const cancel = () => {
    setSaveDisabled(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ alignItems: "center", flex: 1 }}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <ImagePicker
          uri={localImage}
          title={localImage ? "Edit image" : "Pick image"}
          onPress={selectImage}
        />
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
        {!!error && <ValidationError text={error} />}
        <View style={styles.buttonContainer}>
          <Button onPress={save} title="Save" disabled={saveDisabled} />
          <Button onPress={cancel} title="Cancel" color={palette.grey} />
        </View>
        <SaveProgress progress={creationProgress} />

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

interface ImagePickerProps {
  uri: string;
  title: string;
  onPress: () => void;
}

const ImagePicker = (props: ImagePickerProps) => {
  const { uri, title, onPress } = props;

  return (
    <View style={styles.imageForm}>
      <Image
        source={{ uri }}
        style={{ width: 180, height: 180, borderRadius: 5 }}
      />
      <Button title={title} onPress={onPress} />
    </View>
  );
};

interface SaveProgressProps {
  progress: number;
}

const SaveProgress = (props: SaveProgressProps) => {
  const { progress } = props;

  return (
    <View>
      <ProgressBar
        visible={!!progress}
        progress={progress}
        style={[styles.progressBar, { width: windowWidth * 0.9 }]}
      />
    </View>
  );
};

interface ValidationErrorProps {
  text: string;
}

const ValidationError = (props: ValidationErrorProps) => {
  const { text } = props;

  return <Text style={styles.error}>{text}</Text>;
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
  imageForm: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  progressBar: {
    margin: 10,
    height: 10,
    borderRadius: 10,
  },
  error: {
    color: palette.red,
  },
});
