import { deleteObject, ref } from "firebase/storage";
import { useEffect, useState } from "react";
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
import { useFinishedBooks } from "../hooks/useFinishedBooks";
import { TBook } from "../types";
import { ensureDate } from "../utils";

export const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ margin: 20 }}>
        <View style={styles.userInfo}>
          <Text>Email: {auth.currentUser?.email}</Text>
        </View>
        <FinishedBookCounts />
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

type BookCount = {
  year: number;
  num: number;
};

const FinishedBookCounts = () => {
  const [counts, setCounts] = useState<Array<BookCount>>([]);
  const { data: finishedBooks, loading: finishedBooksLoading } =
    useFinishedBooks();

  useEffect(() => {
    if (!finishedBooksLoading) {
      const yearCounts = new Map();
      finishedBooks.forEach((book: TBook) => {
        if (!book.finished) {
          console.error(book);
          throw new Error("Finished book does not have finished date");
        }
        const finishedDate = ensureDate(book.finished);
        const year = finishedDate.getFullYear();

        if (yearCounts.has(year)) {
          let currentCount = yearCounts.get(year);
          yearCounts.set(year, currentCount + 1);
        } else {
          yearCounts.set(year, 1);
        }
      });

      let countsArr: Array<BookCount> = [];
      yearCounts.forEach((value, key) =>
        countsArr.push({ year: key, num: value })
      );
      setCounts(countsArr);
    }
  }, [JSON.stringify(finishedBooks), finishedBooksLoading]);

  return (
    <View style={styles.finishedBookCounts}>
      <Text style={{ marginBottom: 5 }}>Books Read</Text>
      {counts.map((count) => (
        <View
          key={count.year}
          style={{ display: "flex", flexDirection: "row" }}
        >
          <Text style={{ width: "15%" }}>{count.year}: </Text>
          <Text style={{ width: "5%", textAlign: "right" }}>{count.num}</Text>
        </View>
      ))}
    </View>
  );
};

const Policies = () => {
  return (
    <View style={styles.policies}>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL("https://pages.flycricket.io/whetstone/privacy.html")
        }
      >
        <Text style={styles.link}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL("https://pages.flycricket.io/whetstone/terms.html")
        }
      >
        <Text style={styles.link}>Terms of Service</Text>
      </TouchableOpacity>
    </View>
  );
};

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
  finishedBookCounts: {
    marginBottom: 20,
  },
  policies: {
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
