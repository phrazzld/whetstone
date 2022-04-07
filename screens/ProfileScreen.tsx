import { Button, SafeAreaView, StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { auth } from "../firebase";

export const ProfileScreen = () => {
  console.log("auth.currentUser:", auth.currentUser);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ margin: 20 }}>
        <Text>ID: {auth.currentUser?.uid}</Text>
        <Text>Email: {auth.currentUser?.email}</Text>
      </View>
      <View style={{ margin: 20 }}>
        <Button
          title="Sign Out"
          onPress={() => auth.signOut()}
          color="#cc0000"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
});
