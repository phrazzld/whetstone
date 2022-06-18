import { deleteObject, ref } from "firebase/storage";
import {
  Alert,
  Button,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, Text, View } from "../components/Themed";
import { palette } from "../constants/Colors";
import {
  auth,
  deleteBook,
  deleteNote,
  getBookNotes,
  getBooks,
  storage,
} from "../firebase";
import { TBook } from "../types";

export const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ margin: 20 }}>
        <View style={styles.userInfo}>
          <Text>Email: {auth.currentUser?.email}</Text>
        </View>
        <Policies />
      </View>
      <View style={{ margin: 20 }}>
        <View style={styles.buttons}>
          <Button title="Sign Out" onPress={() => auth.signOut()} />
          <Button
            title="Delete Account"
            onPress={confirmAccountDeletion}
            color={palette.red}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const Policies = () => {
  return (
    <View style={styles.policies}>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            "https://pages.flycricket.io/whetstone/privacy.html"
          )
      }
      >
        <Text style={styles.link}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            "https://pages.flycricket.io/whetstone/terms.html"
          )
      }
      >
        <Text style={styles.link}>Terms of Service</Text>
      </TouchableOpacity>
    </View>
  )
}

const deleteNotes = async (books: Array<TBook>): Promise<void> => {
  console.log("Deleting notes...");
  for (const book of books) {
    const bookNotes = await getBookNotes(book.id);
    // Delete notes
    for (const note of bookNotes) {
      await deleteNote(book.id, note.id);
    }
  }
  console.log("Notes deleted.");
};

const deleteImages = async (books: Array<TBook>): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("Can't delete user. No user logged in.");
  }

  console.log("Deleting images...");
  for (const book of books) {
    const bookImageRef = ref(
      storage,
      `${auth.currentUser.uid}/${book.id}/cover.jpg`
    );
    try {
      await deleteObject(bookImageRef);
    } catch (err) {
      console.log(err);
    }
  }
  console.log("Images deleted.");
};

const deleteBooks = async (books: Array<TBook>): Promise<void> => {
  console.log("Deleting books...");
  for (const book of books) {
    await deleteBook(book.id);
  }
  console.log("Books deleted.");
};

const deleteUser = async (): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("Can't delete user. No user logged in.");
  }

  console.log("Deleting account...");
  auth.currentUser
    .delete()
    .then(() => {
      Alert.alert("Account Deleted", "Your account has been deleted.");
    })
    .catch((err) => {
      console.log(err);
      if (err.code.includes("requires-recent-login")) {
        Alert.alert(
          "Reauthenticate",
          "You need to reauthenticate to delete your account. Please sign back in and try again.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Sign Out",
              onPress: () => auth.signOut(),
            },
          ]
        );
      }
    });
};

const deleteAccount = async (): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error("Can't delete user. No user logged in.");
  }

  console.log("Deleting user...");

  const books = await getBooks();

  await deleteNotes(books);
  await deleteImages(books);
  await deleteBooks(books);
  await deleteUser();
};

const confirmAccountDeletion = () => {
  Alert.alert(
    "Delete Account",
    "Are you sure you want to delete your account? This will delete all of your data, and cannot be undone.",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => deleteAccount(),
      },
    ],
    { cancelable: false }
  );
};

const styles = StyleSheet.create({
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  link: {
    color: palette.blue,
  },
  policies: {},
  userInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
