import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
import { TBook, TBookList } from "../types";
import { ensureDate, LISTS, pickImage } from "../utils";
import { useStore } from "../zstore";

const windowWidth = Dimensions.get("window").width;

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

interface TitleInputProps {
  title: string;
  onChangeTitle: (t: string) => void;
}

const TitleInput = (props: TitleInputProps) => {
  const { title, onChangeTitle } = props;

  return (
    <TextInput
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

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (event: DateTimePickerEvent, date: Date | undefined) => void;
}

const DatePicker = (props: DatePickerProps) => {
  const { label, value, onChange } = props;

  return (
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
      <Text style={{ fontSize: 16, width: "25%" }}>{label}</Text>
      <DateTimePicker
        style={{ width: "40%" }}
        value={value}
        mode="date"
        onChange={onChange}
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
  const book = route.params?.book;
  const [title, setTitle] = useState<string>(book?.title);
  const [author, setAuthor] = useState<string>(book?.author);
  const [list, setList] = useState<TBookList | null>(whatList(book));
  const [started, setStarted] = useState<Date | null>(initStarted(book));
  const [finished, setFinished] = useState<Date | null>(initFinished(book));
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

  const navToNextScreen = (payload: any): void => {
    if (!!book) {
      navigation.navigate("BookDetails", {
        book: { ...book, ...payload },
      });
    } else {
      navigation.navigate("Books");
    }
  };

  const uploadImage = async (
    image: any,
    bookId: string,
    payload: any
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
      setCreationProgress(0.01);
      uploadImage(image, bookId, payload);
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
    setStarted(initStarted(book) || new Date());
    setFinished(null);
  };

  const isFinished = (): void => {
    setList("Finished");
    setStarted(initStarted(book) || new Date());
    setFinished(initFinished(book) || new Date());
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
