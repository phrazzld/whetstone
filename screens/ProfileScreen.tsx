import {
  Alert,
  Button,
  Linking,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView, Text, View } from "../components/Themed";
import {
  auth,
  storage,
  getBooks,
  getBookNotes,
  deleteNote,
  deleteBook,
} from "../firebase";
import { ref, deleteObject } from "firebase/storage";

export const ProfileScreen = () => {
  const deleteAccount = () => {
    // Confirm account deletion
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
          onPress: async () => {
            if (!auth.currentUser) {
              throw new Error("Can't delete user. No user logged in.");
            }

            console.log("Deleting user...");

            // Get books and notes
            const books = await getBooks();
            console.log("Deleting notes...");
            for (const book of books) {
              const bookNotes = await getBookNotes(book.id);
              // Delete notes
              for (const note of bookNotes) {
                await deleteNote(book.id, note.id);
              }
            }
            console.log("Notes deleted.");

            // Delete images
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

            // Delete books
            console.log("Deleting books...");
            for (const book of books) {
              await deleteBook(book.id);
            }
            console.log("Books deleted.");

            // Delete account
            console.log("Deleting account...");
            auth.currentUser
              .delete()
              .then(() => {
                Alert.alert(
                  "Account Deleted",
                  "Your account has been deleted."
                );
              })
              .catch((err) => {
                console.log(err);
                if (err.code.includes("requires-recent-login")) {
                  // Reauthenticate user
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
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ margin: 20 }}>
        <View style={styles.userInfo}>
          <Text>Email: {auth.currentUser?.email}</Text>
        </View>
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
      </View>
      <View style={{ margin: 20 }}>
        <View style={styles.buttons}>
          <Button title="Sign Out" onPress={() => auth.signOut()} />
          <Button
            title="Delete Account"
            onPress={deleteAccount}
            color="#cc0000"
          />
        </View>
      </View>
    </SafeAreaView>
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
    color: "#147efb",
  },
  policies: {},
  userInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
