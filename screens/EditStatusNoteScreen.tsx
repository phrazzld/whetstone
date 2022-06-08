import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { DatePicker } from "../components/DatePicker";
import { SafeAreaView, View } from "../components/Themed";
import { auth, updateNote } from "../firebase";
import { AddNoteScreenParams, StatusNotePayload } from "../types";
import { ensureDate } from "../utils";

// TODO: Determine whether edited status note is most recent of its kind (pre-edit)
//       If so, update book.started/finished accordingly

export const EditStatusNoteScreen = () => {
  const route = useRoute();
  const params: AddNoteScreenParams | null = route.params || null;
  const [date, setDate] = useState(
    ensureDate(
      params?.editNote?.date || params?.editNote?.createdAt || new Date()
    )
  );
  const navigation = useNavigation();

  const modifyNote = () => {
    if (
      !params?.bookId ||
      !params.editNote ||
      (params.editNote.type !== "started" &&
        params.editNote.type !== "finished")
    ) {
      throw new Error("Cannot modify note, invalid route params");
    }

    const payload: StatusNotePayload = {
      type: params?.editNote?.type,
      date: date,
      updatedAt: new Date(),
    };
    if (!!date) {
      updateNote(params.bookId, params.editNote.id, payload);
    }
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

  const save = () => {
    if (!auth.currentUser) {
      throw new Error("Cannot save note, user is not logged in.");
    }

    if (params?.editNote) {
      modifyNote();
    }
  };

  const cancel = () => {
    navigation.goBack();
  };

  const dateLabel =
    params?.editNote?.type === "started" ? "Started on: " : "Finished on: ";

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={[styles.container, { width: "100%" }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <DatePicker
          label={dateLabel}
          value={date}
          onChange={onDatePickerChange}
        />
        <View style={styles.buttonContainer}>
          <Button onPress={save} title="Save" />
          <Button onPress={cancel} title="Cancel" color="gray" />
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
    padding: 10,
    paddingTop: 20,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    width: "90%",
    margin: 10,
  },
  multilineInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 100,
    width: "90%",
    margin: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
