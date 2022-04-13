import {
  Alert,
  Button,
  SafeAreaView,
  Linking,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Text, View } from "../components/Themed";
import { auth } from "../firebase";

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
          onPress: () => {
            // Delete account
            // TODO: Unstub
            //auth.currentUser.delete().then(() => {
            //  Alert.alert("Account Deleted", "Your account has been deleted.");
            //});
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
    backgroundColor: "#fff",
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
