import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as admin from "firebase-admin";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet } from "react-native";
import { SafeAreaView, View } from "../components/Themed";
import { palette } from "../constants/Colors";
import { EditBookScreenParams, ReadDates } from "../types";
import { ensureDate } from "../utils";

// TODO: Unstub
// TODO: Render reading dates as DatePickers
//       - render started/finished too, unless they match one of the readingDates
// TODO: Enable deleting any reading date
//       - maybe not swipeable, since each date pair will share a line
// TODO: Enable adding new reading dates
// TODO: Save / Cancel action buttons
//       - on save, update book with new reading dates and nullify started/finished
export const ManageReadingDatesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params: EditBookScreenParams | null = route.params || null;
  const book = params?.book;
  const [dates, setDates] = useState<Array<ReadDates>>([]);

  // Whenever the book changes, reinitialize local dates
  useEffect(() => {
    initDatesRead();
  }, [JSON.stringify(book)]);

  const initDatesRead = (): void => {
    if (!book) {
      console.warn("Cannot initialize dates read without a book.");
      return;
    }

    let d = [];
    if (!!book.started) {
      let legacyDates: ReadDates = {
        started: book.started,
        finished: book.finished || null,
      };
      d.push(legacyDates);
    }

    if (!!book.readingDates) {
      d.push(...book.readingDates);
    }

    setDates(d);
  };

  console.log("dates:", dates);

  const onSave = (): void => {
    console.log("STUB SAVE");
    navigation.goBack();
  };

  const onCancel = (): void => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {dates.map((readDates: ReadDates, index: number) => (
        <DatePickerRange
          key={index}
          started={readDates.started}
          finished={readDates.finished}
        />
      ))}
      <FormButtons save={onSave} cancel={onCancel} />
    </SafeAreaView>
  );
};

interface DatePickerRange {
  started: admin.firestore.Timestamp | Date;
  finished: admin.firestore.Timestamp | Date | null;
}

const DatePickerRange = (props: DatePickerRange) => {
  const { started, finished } = props;
  const [startDate, setStartDate] = useState(ensureDate(started));
  const [finishDate, setFinishDate] = useState(
    !!finished ? ensureDate(finished) : null
  );

  // TODO: Unstub
  const handleChangeStarted = (
    _event: DateTimePickerEvent,
    date: Date | undefined
  ): void => {
    if (!!date) {
      setStartDate(date);
    }
  };

  const handleChangeFinished = (
    _event: DateTimePickerEvent,
    date: Date | undefined
  ): void => {
    if (!!date) {
      setFinishDate(date);
    }
  };

  // TODO: Enable adding a finished date to the range if one does not exist
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "90%",
      }}
    >
      <DateTimePicker
        style={{ width: "40%" }}
        mode="date"
        value={startDate}
        onChange={handleChangeStarted}
      />
      {!!finishDate && (
        <DateTimePicker
          style={{ width: "40%" }}
          mode="date"
          value={finishDate}
          onChange={handleChangeFinished}
        />
      )}
    </View>
  );
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
});
