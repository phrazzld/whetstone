import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import { auth, storage } from "../firebase";
import { useStore } from "../zstore";

export const useNoteImage = (bookId: string, noteId: string) => {
  const [image, setImage] = useState("");
  const staleNoteImage = useStore((state) => state.staleNoteImage);
  const setStaleNoteImage = useStore((state) => state.setStaleNoteImage);

  const getImage = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("Cannot get note image. No user logged in.");
      }

      const imageRef = ref(
        storage,
        `${auth.currentUser.uid}/${bookId}/${noteId}.jpg`
      );
      const url = await getDownloadURL(imageRef);
      if (url) {
        setImage(url);
      }
    } catch (err) {
      if (err.message.includes("storage/object-not-found")) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    getImage();
  }, [bookId, noteId]);

  useEffect(() => {
    if (staleNoteImage === noteId) {
      getImage().then(() => setStaleNoteImage(""));
    }
  }, [staleNoteImage]);

  return image;
};
