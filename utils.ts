import * as ImagePicker from "expo-image-picker";
import { auth } from "./firebase";
import { TBookList } from "./types";

export const dateLocaleStringOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const LISTS: Array<TBookList> = ["Reading", "Finished", "Unread"];

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

export const ensureDate = (date: any): Date => {
  if (date instanceof Date) {
    return date;
  }

  return date.toDate();
};
