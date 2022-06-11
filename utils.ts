import * as ImagePicker from "expo-image-picker";
import * as admin from "firebase-admin";
import { auth } from "./firebase";
import { TBook, TBookList } from "./types";

export const dateLocaleStringOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
} as const;

export const LISTS: Array<TBookList> = ["Reading", "Finished", "Unread"];

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

// TODO: Look at readingDates instead of started/finished
// TODO: Take a param to return multiline (or extract to new function)
export const formatReadDates = (book: TBook): string => {
  let timeline = "";

  const startDate = book.started
    ? ensureDate(book.started).toLocaleString([], dateLocaleStringOptions)
    : null;

  const finishDate = book.finished
    ? ensureDate(book.finished).toLocaleString([], dateLocaleStringOptions)
    : null;

  if (!!startDate) {
    if (!!finishDate) {
      timeline = startDate.concat(" - ").concat(finishDate);
    } else {
      timeline = `Started: ${startDate}`;
    }
  }

  return timeline;
}
