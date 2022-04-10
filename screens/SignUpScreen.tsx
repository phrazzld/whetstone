import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { SafeAreaView, TextInput, Button, StyleSheet } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

export const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const signUp = () => {
    try {
      createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={signUp} />
      <Button
        title="Go to Signin"
        onPress={() => navigation.navigate("SignIn")}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 40,
    width: "90%",
    margin: 10,
  },
});
