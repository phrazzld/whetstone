import * as ImagePicker from "expo-image-picker";
import * as admin from "firebase-admin";
import { auth } from "./firebase";

export const pickImage = async (): Promise<
  ImagePicker.ExpandImagePickerResult<
    ImagePicker.ImagePickerOptions | ImagePicker.OpenFileBrowserOptions
  >
> => {
  if (!auth.currentUser) {
    throw new Error("Cannot edit book image, user is not logged in.");
  }

  try {
    // Check media permissions
    const permissions = await ImagePicker.getMediaLibraryPermissionsAsync();

    // If media permissions are not granted, request permissions
    if (permissions.granted === false) {
      const newPermissions =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

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

export const ensureDate = (date: Date | admin.firestore.Timestamp): Date => {
  if (date instanceof Date) {
    return date;
  }

  return date.toDate();
};

export const strToInt = (str: string): number => {
  return parseInt(str.replace(/\s+/g, ""), 10);
};
