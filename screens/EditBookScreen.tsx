import DateTimePicker from "@react-native-community/datetimepicker";
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
import SelectDropdown from "react-native-select-dropdown";
import { SafeAreaView, Text, View } from "../components/Themed";
import { auth, createBook, storage, updateBook } from "../firebase";
import { pickImage } from "../utils";
import { useStore } from "../zstore";

const windowWidth = Dimensions.get("window").width;

type TBookList = "Reading" | "Finished" | "Unread";

const LISTS: Array<TBookList> = ["Reading", "Finished", "Unread"];

export const EditBookScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const book = route.params?.book;
  const [title, setTitle] = useState<string>(book?.title);
  const [author, setAuthor] = useState<string>(book?.author);
  const [list, setList] = useState<TBookList | null>(
    !!book
      ? !!book.started
        ? !!book.finished
          ? "Finished"
          : "Reading"
        : "Unread"
      : null
  );
  const [started, setStarted] = useState<Date | null>(book?.started?.toDate());
  const [finished, setFinished] = useState<Date | null>(
    book?.finished?.toDate()
  );
  const [localImage, setLocalImage] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [creationProgress, setCreationProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState("");
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
    if (book) {
      getImage();
    }
  }, [book]);

  const saveChanges = async () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book, user is not logged in.");
    }

    if (!title) {
      setError("Title field cannot be blank.");
      return;
    }

    if (!author) {
      setError("Author field cannot be blank.");
      return;
    }

    if (!list) {
      setError("Please select a list.");
      return;
    }

    try {
      setProgressText("Saving book details...");
      let payload = {
        title,
        author,
        started,
        finished,
      };

      let bookId: string;
      if (!book) {
        const bookRef = await createBook(payload);
        bookId = bookRef.id;
      } else {
        bookId = book.id;
        await updateBook(bookId, payload);
      }

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

            if (!!book) {
              navigation.navigate("BookDetails", {
                book: { ...book, ...payload },
              });
            } else {
              navigation.navigate("Books");
            }
          }
        );
      } else {
        if (!!book) {
          navigation.navigate("BookDetails", {
            book: { ...book, ...payload },
          });
        } else {
          navigation.navigate("Books");
        }
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const cancel = () => {
    if (!!book) {
      navigation.navigate("BookDetails", { book });
    } else {
      navigation.navigate("Books");
    }
  };

  const isReading = (): void => {
    setList("Reading");
    setStarted(new Date());
    setFinished(null);
  };

  const isFinished = (): void => {
    setList("Finished");
    setStarted(new Date());
    setFinished(new Date());
  };

  const isUnread = (): void => {
    setList("Unread");
    setStarted(null);
    setFinished(null);
  };

  const onStartDatePickerChange = (event, selectedDate) => {
    const date = selectedDate;
    setStarted(date);
  };

  const onFinishDatePickerChange = (event, selectedDate) => {
    const date = selectedDate;
    setFinished(date);
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
        <SelectDropdown
          data={LISTS}
          onSelect={(selectedItem) => {
            switch (selectedItem) {
              case "Reading":
                isReading();
                break;
              case "Finished":
                isFinished();
                break;
              case "Unread":
                isUnread();
                break;
              default:
                throw new Error(
                  `Unrecognized list type selected: ${selectedItem}`
                );
            }
          }}
          buttonTextAfterSelection={(selectedItem) => selectedItem}
          rowTextForSelection={(item) => item}
          buttonStyle={styles.input}
          defaultButtonText="Select a list"
          defaultValue={list}
        />
        {!!book?.started && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              marginVertical: 10,
              width: "90%",
            }}
          >
            <Text style={{ fontSize: 16, width: "25%" }}>Started:</Text>
            <DateTimePicker
              style={{ width: "40%" }}
              value={started}
              mode="date"
              onChange={onStartDatePickerChange}
            />
          </View>
        )}
        {!!book?.finished && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              marginVertical: 10,
              width: "90%",
            }}
          >
            <Text style={{ fontSize: 16, width: "25%" }}>Finished:</Text>
            <DateTimePicker
              style={{ width: "40%" }}
              value={finished}
              mode="date"
              onChange={onFinishDatePickerChange}
            />
          </View>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.buttonContainer}>
          <Button onPress={saveChanges} title="Save" />
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
  error: {
    color: "#cc0000",
  },
});
