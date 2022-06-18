import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";
import { DatePicker } from "../components/DatePicker";
import { TextField } from "../components/TextField";
import { SafeAreaView, Text, View } from "../components/Themed";
import { LISTS, TABS, windowWidth } from "../constants";
import { palette } from "../constants/Colors";
import { auth, createBook, storage, updateBook } from "../firebase";
import { BookPayload, EditBookScreenParams, TBook, TBookList } from "../types";
import { ensureDate, pickImage } from "../utils";
import { useStore } from "../zstore";

const whatList = (book: TBook | null): TBookList | null => {
  if (!book) {
    return null;
  }

  if (book.started) {
    if (book.finished) {
      return "Finished";
    }
    return "Reading";
  }

  return "Unread";
};

// Takes input values as parameters, returns an error string
// Error string is empty if no validation errors are found
const validateInputs = (
  title: string,
  author: string,
  list: TBookList | null
): string => {
  if (!title) {
    return "Title field cannot be blank.";
  }

  if (!author) {
    return "Author field cannot be blank.";
  }

  if (!list) {
    return "Please select a list.";
  }

  return "";
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

const initStarted = (book: TBook | null): Date | null => {
  if (!!book && !!book.started) {
    return ensureDate(book.started);
  }

  return null;
};

const initFinished = (book: TBook | null): Date | null => {
  if (!!book && !!book.finished) {
    return ensureDate(book.finished);
  }

  return null;
};

interface ListDropdownProps {
  onSelect: (item: any) => void;
  defaultValue: string | null;
}

const ListDropdown = (props: ListDropdownProps) => {
  const { onSelect, defaultValue } = props;

  return (
    <SelectDropdown
      data={LISTS}
      onSelect={onSelect}
      buttonTextAfterSelection={(selectedItem) => selectedItem}
      rowTextForSelection={(item) => item}
      buttonStyle={styles.input}
      defaultButtonText="Select a list"
      defaultValue={defaultValue}
    />
  );
};

interface ValidationErrorProps {
  text: string;
}

const ValidationError = (props: ValidationErrorProps) => {
  const { text } = props;

  return <Text style={styles.error}>{text}</Text>;
};

interface FormButtonsProps {
  save: () => void;
  cancel: () => void;
}

const FormButtons = (props: FormButtonsProps) => {
  const { save, cancel } = props;
  const [saveDisabled, setSaveDisabled] = useState(false);

  const handleSave = (): void => {
    setSaveDisabled(true);
    save();
  };

  const handleCancel = (): void => {
    setSaveDisabled(false);
    cancel();
  };

  return (
    <View style={styles.buttonContainer}>
      <Button onPress={handleSave} title="Save" disabled={saveDisabled} />
      <Button onPress={handleCancel} title="Cancel" color={palette.grey} />
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

export const EditBookScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params: EditBookScreenParams | null = route.params || null;
  const [title, setTitle] = useState<string>(params?.book?.title || "");
  const [author, setAuthor] = useState<string>(params?.book?.author || "");
  const [list, setList] = useState<TBookList | null>(
    whatList(params?.book || null)
  );
  const [started, setStarted] = useState<Date | null>(
    initStarted(params?.book || null)
  );
  const [finished, setFinished] = useState<Date | null>(
    initFinished(params?.book || null)
  );
  const [localImage, setLocalImage] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [creationProgress, setCreationProgress] = useState(0);
  const [error, setError] = useState("");
  const setStaleBookImage = useStore((state) => state.setStaleBookImage);

  const getImage = async () => {
    if (!auth.currentUser) {
      throw new Error("Not logged in");
    }

    const coverRef = ref(
      storage,
      `${auth.currentUser.uid}/${params?.book?.id}/cover.jpg`
    );
    const coverUrl = await getDownloadURL(coverRef);
    if (coverUrl) {
      setLocalImage(coverUrl);
    }
  };

  useEffect(() => {
    if (params?.book) {
      getImage();
    }
  }, [params]);

  const navToNextScreen = (payload: BookPayload): void => {
    let tab = TABS.READING;
    if (!!payload.finished) {
      tab = TABS.FINISHED;
    } else if (!payload.finished && !payload.started) {
      tab = TABS.UNREAD;
    }
    navigation.navigate("Books", { tab });
  };

  const uploadImage = async (
    image: any,
    bookId: string,
    payload: BookPayload
  ): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book, user is not logged in.");
    }

    if (!!image && !image.cancelled) {
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
        },
        () => {
          setStaleBookImage(bookId);
          navToNextScreen(payload);
        }
      );
    } else {
      navToNextScreen(payload);
    }
  };

  const saveChanges = async () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book, user is not logged in.");
    }

    const validationError = validateInputs(title, author, list);

    if (!!validationError) {
      setError(validationError);
      return;
    }

    try {
      let payload: BookPayload = {
        title,
        author,
        started,
        finished,
        updatedAt: new Date(),
      };

      let bookId: string;
      if (!params?.book) {
        payload.createdAt = new Date();
        const bookRef = await createBook(payload);
        bookId = bookRef.id;
      } else {
        bookId = params.book.id;
        await updateBook(bookId, payload);
      }
      setCreationProgress(0.01);
      uploadImage(image, bookId, payload);
    } catch (error) {
      console.log("error:", error);
    }
  };

  const cancel = () => {
    navigation.navigate("Books");
  };

  const isReading = (): void => {
    setList("Reading");
    setStarted(initStarted(params?.book || null) || new Date());
    setFinished(null);
  };

  const isFinished = (): void => {
    setList("Finished");
    setStarted(initStarted(params?.book || null) || new Date());
    setFinished(initFinished(params?.book || null) || new Date());
  };

  const isUnread = (): void => {
    setList("Unread");
    setStarted(null);
    setFinished(null);
  };

  const onStartDatePickerChange = (
    _event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (!!selectedDate) {
      setStarted(selectedDate);
    }
  };

  const onFinishDatePickerChange = (
    _event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (!!selectedDate) {
      setFinished(selectedDate);
    }
  };

  const selectImage = async () => {
    const result = await pickImage();
    if (!result.cancelled) {
      setLocalImage(result.uri);
      setImage(result);
    }
  };

  const onListSelect = (item: string): void => {
    switch (item) {
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
        throw new Error(`Unrecognized list type selected: ${item}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={[styles.container, { width: "100%", paddingTop: 20 }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ImagePicker
          uri={localImage}
          title={localImage ? "Edit image" : "Pick image"}
          onPress={selectImage}
        />
        <TextField
          label="Title"
          text={title}
          onChangeText={setTitle}
          returnKeyType="next"
          autoCapitalize="words"
        />
        <TextField
          label="Author"
          text={author}
          onChangeText={setAuthor}
          returnKeyType="done"
          autoCapitalize="words"
        />
        <ListDropdown onSelect={onListSelect} defaultValue={list} />
        {!!started && (
          <DatePicker
            label="Started: "
            value={started}
            onChange={onStartDatePickerChange}
          />
        )}
        {!!finished && (
          <DatePicker
            label="Finished: "
            value={finished}
            onChange={onFinishDatePickerChange}
          />
        )}
        {!!error && <ValidationError text={error} />}
        <FormButtons save={saveChanges} cancel={cancel} />
        <SaveProgress progress={creationProgress} />

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
  error: {
    color: palette.red,
  },
});
