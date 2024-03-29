import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { TextField } from "../components/TextField";
import { SafeAreaView, Text, View } from "../components/Themed";
import { palette } from "../constants/Colors";
import { auth } from "../firebase";

// TODO: Add loading handler
export const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleError = (err: any): void => {
    console.error(err);
    // If message contains "email-already-in-use" then set error to "Email already in use. Try logging in."
    if (err.message.includes("email-already-in-use")) {
      setError("Email already in use. Try logging in.");
    } else if (err.message.includes("wrong-password")) {
      setError("Wrong password. Try again.");
    } else if (err.message.includes("invalid-email")) {
      setError("Invalid email. Try again.");
    } else if (err.message.includes("auth/user-not-found")) {
      setError("User not found. Try signing up.");
    } else {
      setError(err.message);
    }
  };

  const signUp = async (): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      handleError(err);
    }
  };

  const signIn = async (): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TextField
          label="Email"
          text={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          testID="EmailInput"
        />
        <TextField
          label="Password"
          text={password}
          onChangeText={setPassword}
          returnKeyType="done"
          autoCapitalize="none"
          testID="PasswordInput"
          secureTextEntry
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.actions}>
          <Button title="Sign Up" onPress={signUp} testID="SignUpButton" />
          <Button title="Sign In" onPress={signIn} testID="SignInButton" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    marginTop: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  error: {
    color: palette.red,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: palette.grey,
    borderRadius: 6,
    height: 40,
    width: "75%",
    margin: 10,
  },
});
