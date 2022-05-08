import * as ImagePicker from "expo-image-picker";
import { auth } from "./firebase";

export const dateLocaleStringOptions = {
  year: "2-digit",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export const pickImage = async (): Promise<ExpandImagePickerResult> => {
  if (!auth.currentUser) {
    throw new Error("Cannot edit book image, user is not logged in.");
  }

  try {
    // Check media permissions
    const permissions = await ImagePicker.getMediaLibraryPermissionsAsync();

    // If media permissions are not granted, request permissions
    if (permissions.granted === false) {
      const newPermissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

      // If media permissions are still not granted, return
      if (newPermissions.granted === false) {
        throw new Error("Media permissions not granted.");
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    return result;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};
