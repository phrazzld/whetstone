import { StyleSheet } from "react-native";
import { SafeAreaView, Text, View } from "../components/Themed";

export const StudyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ margin: 20 }}>
        <Text>Study STUB</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
