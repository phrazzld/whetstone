import {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  StyleSheet,
} from "react-native";
import { TextInput } from "react-native-paper";

interface TextFieldProps {
  text: string;
  onChangeText: (t: string) => void;
  label: string;
  multiline?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  keyboardType?: KeyboardTypeOptions;
  onFocus?: () => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  testID?: string;
  secureTextEntry?: boolean;
}

export const TextField = (props: TextFieldProps) => {
  const {
    testID,
    secureTextEntry,
    autoCapitalize,
    text,
    label,
    onFocus,
    onChangeText,
    multiline,
    keyboardType,
    returnKeyType,
  } = props;

  return (
    <TextInput
      autoComplete="off"
      mode="outlined"
      multiline={multiline || false}
      label={label}
      placeholder={label}
      style={styles.input}
      value={text}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType || "next"}
      keyboardType={keyboardType || "default"}
      onFocus={onFocus}
      autoCapitalize={autoCapitalize || "none"}
      testID={testID}
      secureTextEntry={secureTextEntry || false}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: "90%",
    margin: 10,
  },
});
