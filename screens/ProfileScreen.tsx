import { useEffect, useState } from "react";
import { Button, SafeAreaView, StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { Text } from "../components/Themed";
import { RootTabScreenProps, TBook } from "../types";
import { collection, where, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

export const ProfileScreen = () => {
  console.log("auth.currentUser:", auth.currentUser);

  return (
    <SafeAreaView style={styles.container}>
      <Text>ID: {auth.currentUser?.uid}</Text>
      <Text>Email: {auth.currentUser?.email}</Text>
      <Button title="Sign Out" onPress={() => auth.signOut()} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});
