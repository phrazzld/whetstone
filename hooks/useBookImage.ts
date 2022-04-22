import { useState, useEffect } from "react";
import { auth, storage } from "../firebase";
import { useStore } from "../zstore";
import { ref, getDownloadURL } from "firebase/storage";

export const FALLBACK_IMAGE = "https://picsum.photos/200/300.jpg";

export const useBookImage = (bookId: string, useFallback: boolean = false) => {
  const [image, setImage] = useState("");
  const staleBookImage = useStore((state) => state.staleBookImage);
  const setStaleBookImage = useStore((state) => state.setStaleBookImage);

  const getImage = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("Cannot get book image. No user logged in.");
      }

      const imageRef = ref(
        storage,
        `${auth.currentUser.uid}/${bookId}/cover.jpg`
      );
      const url = await getDownloadURL(imageRef);
      if (url) {
        setImage(url);
      } else if (useFallback) {
        setImage(FALLBACK_IMAGE);
      }
    } catch (err) {
      if (err.message.includes("storage/object-not-found")) {
        if (useFallback) {
          setImage(FALLBACK_IMAGE);
        }
      } else {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    getImage();
  }, [bookId]);

  useEffect(() => {
    if (staleBookImage === bookId) {
      getImage().then(() => setStaleBookImage(""));
    }
  }, [staleBookImage]);

  return image;
};