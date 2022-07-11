import { Button, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../components/Themed";
import { palette } from "../constants/Colors";

interface ImagePickerProps {
  uri: string;
  onPress: () => void;
}

export const ImagePicker = (props: ImagePickerProps) => {
  const { uri, onPress } = props;

  return (
    <View style={styles.imageForm}>
      {!!uri ? (
        <TouchableOpacity onPress={onPress}>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: palette.grey,
              opacity: 0.8,
              zIndex: 1,
              padding: 5,
            }}
          >
            <Text>Edit image</Text>
          </View>
          <Image
            source={{ uri }}
            style={{ width: 180, height: 180, borderRadius: 5 }}
          />
        </TouchableOpacity>
      ) : (
        <Button title="Add image" onPress={onPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageForm: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10
  },
});
