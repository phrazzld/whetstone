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
import { TBook, TNote } from "../types";
import { ensureDate } from "../utils";
import { useAllFinishedNotes } from "../hooks/useAllFinishedNotes";

export const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ margin: 20 }}>
        <View style={styles.section}>
          <Text style={styles.heading}>EMAIL</Text>
          <Text style={styles.text}>{auth.currentUser?.email}</Text>
        </View>
        <FinishedBookCounts />
      </View>
      <View style={{ margin: 20, flex: 1, justifyContent: "space-between" }}>
        <View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => auth.signOut()}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
          <Button
            title="Delete Account"
            onPress={confirmAccountDeletion}
            color={palette.red}
          />
        </View>
        <Policies />
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
  const { data: finishedNotes, loading: finishedBooksLoading } =
    useAllFinishedNotes();

  useEffect(() => {
    if (!finishedBooksLoading) {
      const yearCounts = new Map();
      // TODO: Rewrite to count finished notes for each book
      // Current implementation will not count rereads
      finishedNotes.forEach((note: TNote) => {
        if (note.type !== "finished") {
          console.error(note);
          throw new Error("Note is not a finished note");
        }
        if (!note.date) {
          console.error(note);
          throw new Error("Note does not have a date");
        }
        const finishedDate = ensureDate(note.date);
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
  }, [JSON.stringify(finishedNotes), finishedBooksLoading]);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>BOOKS READ</Text>
      {counts.map((count) => (
        <View
          key={count.year}
          style={{ display: "flex", flexDirection: "row" }}
        >
          <Text style={[styles.text, { width: "15%" }]}>{count.year}: </Text>
          <Text style={[styles.text, { width: "10%", textAlign: "right" }]}>
            {count.num}
          </Text>
        </View>
      ))}
    </View>
  );
};

const Policies = () => {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL("https://pages.flycricket.io/whetstone/privacy.html")
        }
      >
        <Text style={styles.policy}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL("https://pages.flycricket.io/whetstone/terms.html")
        }
      >
        <Text style={styles.policy}>Terms of Service</Text>
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
  container: {
    flex: 1,
    padding: 24,
    textAlign: "left",
    paddingTop: 80,
  },
  header: {
    fontSize: 28,
    marginBottom: 16,
    fontWeight: "bold",
  },
  heading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777",
  },
  text: {
    fontSize: 18,
  },
  policy: {
    fontSize: 13,
    color: palette.blue,
  },
  section: {
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  button: {
    backgroundColor: palette.blue,
    borderRadius: 4,
    paddingVertical: 18,
    marginTop: 12,
    alignItems: "center",
    marginBottom: 24,
  },
});
