import * as ImagePicker from "expo-image-picker";
import * as admin from "firebase-admin";
import { dateLocaleStringOptions } from "./constants";
import { auth } from "./firebase";
import { TBook } from "./types";

export const pickImage = async (): Promise<
  ImagePicker.ExpandImagePickerResult<
    ImagePicker.ImagePickerOptions | ImagePicker.OpenFileBrowserOptions
  >
> => {
  if (!auth.currentUser) {
    throw new Error("Cannot pick image, user is not logged in.");
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

    const image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    return image;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

// TODO: Specify return signature
export const takePhoto = async (): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error("Cannot take photo, user is not logged in.");
  }

  try {
    // Check camera permissions
    const permissions = await ImagePicker.getCameraPermissionsAsync();

    // If camera permissions are not granted, request permissions
    if (permissions.granted === false) {
      const newPermissions = await ImagePicker.requestCameraPermissionsAsync();

      if (newPermissions.granted === false) {
        throw new Error("Camera permissions not granted.");
      }
    }

    // Launch camera
    const photo = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0,
    });

    return photo;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export const ensureDate = (date: Date | admin.firestore.Timestamp): Date => {
  if (date instanceof Date) {
    return date;
  }

  if (typeof date === "string") {
    return new Date(date)
  }

  return date.toDate();
};

export const strToInt = (str: string): number => {
  return parseInt(str.replace(/\s+/g, ""), 10);
};

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
};
