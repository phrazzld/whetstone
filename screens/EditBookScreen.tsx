import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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
import { DatePicker } from "../components/DatePicker";
import { SafeAreaView, Text, View } from "../components/Themed";
import { LISTS, TABS } from "../constants";
import {
  auth,
  createBook,
  createNote,
  storage,
  updateBook,
  updateNote,
} from "../firebase";
import { useStatusNotes } from "../hooks/useStatusNotes";
import {
  BookPayload,
  EditBookScreenParams,
  StatusNotePayload,
  TBookList,
  TNote,
} from "../types";
import { ensureDate, pickImage } from "../utils";
import { useStore } from "../zstore";

const windowWidth = Dimensions.get("window").width;

const whatList = (statusNotes: Array<TNote>): TBookList => {
  if (statusNotes.length === 0) {
    return "Unread";
  }

  if (statusNotes[0].type === "started") {
    return "Reading";
  }

  if (statusNotes[0].type === "finished") {
    return "Finished";
  }

  throw new Error(
    `Could not identify what list book was in based on statusNotes: ${statusNotes}`
  );
};

// Takes input values as parameters, returns an error string
// Error string is empty if no validation errors are found
const validateInputs = (title: string, author: string): string => {
  if (!title) {
    return "Title field cannot be blank.";
  }

  if (!author) {
    return "Author field cannot be blank.";
  }

  return "";
};

interface TitleInputProps {
  title: string;
  onChangeTitle: (t: string) => void;
}

const TitleInput = (props: TitleInputProps) => {
  const { title, onChangeTitle } = props;

  return (
    <TextInput
      autoComplete="off"
      mode="outlined"
      label="Title"
      placeholder="Title"
      style={styles.input}
      value={title}
      onChangeText={onChangeTitle}
      returnKeyType="next"
    />
  );
};

interface AuthorInputProps {
  author: string;
  onChangeAuthor: (a: string) => void;
}

const AuthorInput = (props: AuthorInputProps) => {
  const { author, onChangeAuthor } = props;

  return (
    <TextInput
      autoComplete="off"
      mode="outlined"
      label="Author"
      placeholder="Author"
      style={styles.input}
      value={author}
      onChangeText={onChangeAuthor}
      returnKeyType="done"
    />
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

const initStarted = (statusNotes: Array<TNote>): Date | null => {
  // Find the first started note
  const mostRecentStartedNote = statusNotes.find(
    (n: TNote) => n.type === "started"
  );
  if (mostRecentStartedNote?.date) {
    return ensureDate(mostRecentStartedNote.date);
  }

  return null;
};

const initFinished = (statusNotes: Array<TNote>): Date | null => {
  // Find the first started note
  const mostRecentFinishedNote = statusNotes.find(
    (n: TNote) => n.type === "finished"
  );
  if (mostRecentFinishedNote?.date) {
    return ensureDate(mostRecentFinishedNote.date);
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

  return (
    <View style={styles.buttonContainer}>
      <Button onPress={save} title="Save" />
      <Button onPress={cancel} title="Cancel" color="gray" />
    </View>
  );
};

interface SaveProgressProps {
  progress: number;
}

const SaveProgress = (props: SaveProgressProps) => {
  const { progress } = props;

  return (
    <View style={styles.progressContainer}>
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
  const statusNotes = useStatusNotes(params?.book?.id || "");
  const [list, setList] = useState<TBookList>(whatList(statusNotes));
  const [started, setStarted] = useState<Date | null>(initStarted(statusNotes));
  const [finished, setFinished] = useState<Date | null>(
    initFinished(statusNotes)
  );
  const [localImage, setLocalImage] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [creationProgress, setCreationProgress] = useState(0);
  const [error, setError] = useState("");
  const setStaleBookImage = useStore((state) => state.setStaleBookImage);

  useEffect(() => {
    setList(whatList(statusNotes));
    setStarted(initStarted(statusNotes));
    setFinished(initFinished(statusNotes));
  }, [JSON.stringify(statusNotes)]);

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

  const navToNextScreen = (): void => {
    let nextTab: 0 | 1 | 2 = TABS.UNREAD;
    if (list === "Reading") {
      nextTab = TABS.READING;
    } else if (list === "Finished") {
      nextTab = TABS.FINISHED;
    }

    navigation.navigate("Books", { tab: nextTab });
  };

  const uploadImage = async (image: any, bookId: string): Promise<void> => {
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
          navToNextScreen();
        }
      );
    } else {
      navToNextScreen();
    }
  };

  const saveChanges = async () => {
    if (!auth.currentUser) {
      throw new Error("Cannot edit book, user is not logged in.");
    }

    const validationError = validateInputs(title, author);

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

      const startedNotePayload: StatusNotePayload = {
        type: "started",
        createdAt: new Date(),
        updatedAt: new Date(),
        date: started || new Date(),
      };
      const finishedNotePayload: StatusNotePayload = {
        type: "finished",
        createdAt: new Date(),
        updatedAt: new Date(),
        date: finished || new Date(),
      };

      // Create status notes based on selected list
      // TODO: Handle updating note dates
      switch (list) {
        case "Reading":
          // Create a "started" note if the last status note is not "started"
          if (
            statusNotes.length === 0 ||
            (statusNotes.length > 0 && statusNotes[0].type !== "started")
          ) {
            createNote(bookId, startedNotePayload);
          }
          if (
            statusNotes.length > 0 &&
            statusNotes[0].type === "started" &&
            statusNotes[0].date !== started
          ) {
            const updateNotePayload: StatusNotePayload = {
              type: "started",
              updatedAt: new Date(),
              date: started || new Date(),
            };
            updateNote(bookId, statusNotes[0].id, updateNotePayload);
          }
          break;
        case "Finished":
          // No status notes? Create both started and finished status notes
          if (statusNotes.length === 0) {
            createNote(bookId, startedNotePayload);
            createNote(bookId, finishedNotePayload);
          } else if (statusNotes[0].type === "started") {
            // Last status note is started? Create a finished status note
            createNote(bookId, finishedNotePayload);
          }
          // Otherwise, the last status note was finished, don't create any new notes
          // But do check if we need to update existing notes
          if (statusNotes.length > 0) {
            const mostRecentStartedNote = statusNotes.find(
              (n: TNote) => n.type === "started"
            );
            const mostRecentFinishedNote = statusNotes.find(
              (n: TNote) => n.type === "finished"
            );
            if (
              mostRecentStartedNote?.date &&
              mostRecentStartedNote.date !== started
            ) {
              updateNote(bookId, mostRecentStartedNote.id, {
                type: "started",
                updatedAt: new Date(),
                date: started || new Date(),
              });
            }
            if (
              mostRecentFinishedNote?.date &&
              mostRecentFinishedNote.date !== finished
            ) {
              updateNote(bookId, mostRecentFinishedNote.id, {
                type: "finished",
                updatedAt: new Date(),
                date: finished || new Date(),
              });
            }
          }

          break;
        case "Unread":
          break;
        default:
          throw new Error(`Unrecognized list option: ${list}`);
      }

      setCreationProgress(0.01);
      uploadImage(image, bookId);
    } catch (error) {
      console.log("error:", error);
    }
  };

  const cancel = () => {
    navigation.navigate("Books");
  };

  const isReading = (): void => {
    setList("Reading");
    setStarted(initStarted(statusNotes) || new Date());
    setFinished(null);
  };

  const isFinished = (): void => {
    setList("Finished");
    setStarted(initStarted(statusNotes) || new Date());
    setFinished(initFinished(statusNotes) || new Date());
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

  const onListSelect = (item: any): void => {
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
        <TitleInput title={title} onChangeTitle={setTitle} />
        <AuthorInput author={author} onChangeAuthor={setAuthor} />

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
  progressContainer: {},
  error: {
    color: "#cc0000",
  },
});
