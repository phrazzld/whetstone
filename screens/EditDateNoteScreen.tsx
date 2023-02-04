import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, Platform, StyleSheet, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SelectDropdown from "react-native-select-dropdown";
import { DatePicker } from "../components/DatePicker";
import { SafeAreaView, View } from "../components/Themed";
import { palette } from "../constants/Colors";
import { auth, createNote, updateNote } from "../firebase";
import { DateNotePayload, EditNoteScreenParams, TNote } from "../types";
import { ensureDate } from "../utils";

interface ListDropdownProps {
  onSelect: (item: any) => void;
  defaultValue: string | null;
}

const ListDropdown = (props: ListDropdownProps) => {
  const { onSelect, defaultValue } = props;

  return (
    <SelectDropdown
      data={["started", "finished", "shelved"]}
      onSelect={onSelect}
      buttonTextAfterSelection={(selectedItem) => selectedItem}
      rowTextForSelection={(item) => item}
      buttonStyle={styles.input}
      defaultButtonText="Select a list"
      defaultValue={defaultValue}
    />
  );
};
const initDate = (note: TNote | null): Date | null => {
  if (!!note && !!note.date) {
    return ensureDate(note.date);
  }

  return null;
};

export const EditDateNoteScreen = () => {
  const route = useRoute();
  const params: EditNoteScreenParams | null = route.params || null;
  const [date, setDate] = useState<Date | null>(
    initDate(params?.editNote || null)
  );
  const [action, setAction] = useState<"started" | "finished" | "shelved">(
    params?.editNote?.type || "started"
  );
  const navigation = useNavigation();
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [error, setError] = useState("");

  const addNote = async (): Promise<void> => {
    if (!params?.bookId) {
      setError("No book ID provided");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    const note: DateNotePayload = {
      type: action,
      date: date,
      createdAt: new Date(),
    };
    const noteRef = await createNote(params.bookId, note);
  };

  const modifyNote = async (): Promise<void> => {
    if (!params?.bookId || !params.editNote) {
      setError("No book ID or note provided");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    const payload: DateNotePayload = {
      type: action,
      date,
      updatedAt: new Date(),
    };
    await updateNote(params.bookId, params.editNote.id, payload);
  };

  const onListSelect = (item: "started" | "finished" | "shelved") => {
    setAction(item);
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
    navigation.goBack();
  };

  const cancel = () => {
    setSaveDisabled(false);
    navigation.goBack();
  };

  const onDatePickerChange = (
    _event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (!!selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={{ alignItems: "center", flex: 1 }}>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <ListDropdown onSelect={onListSelect} defaultValue={action} />
        <DatePicker
          label="Date: "
          value={date || new Date()}
          onChange={onDatePickerChange}
        />
        {!!error && <ValidationError text={error} />}
        <View style={styles.buttonContainer}>
          <Button onPress={save} title="Save" disabled={saveDisabled} />
          <Button onPress={cancel} title="Cancel" color={palette.grey} />
        </View>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

interface SaveProgressProps {
  progress: number;
}

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
  input: {
    width: "90%",
    margin: 10,
  },
});
