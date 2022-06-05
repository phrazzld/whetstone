import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Text, View } from "../components/Themed";

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (event: DateTimePickerEvent, date: Date | undefined) => void;
}

export const DatePicker = (props: DatePickerProps) => {
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
