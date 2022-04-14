import { useState, useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { TBook } from "../types";
import { View, Text } from "./Themed";
import { useNavigation } from "@react-navigation/native";
import { ref, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase";
import { useStore } from "../zstore";

interface BookProps {
  book: TBook;
}

const DEFAULT_IMAGE = "https://picsum.photos/200/300.jpg";

export const Book = (props: BookProps) => {
  const { book } = props;
  const navigation = useNavigation();
  const [image, setImage] = useState("");
  const staleBookImage = useStore((state) => state.staleBookImage);
  const setStaleBookImage = useStore((state) => state.setStaleBookImage);

  const getImage = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("Not logged in");
      }

      const coverRef = ref(
        storage,
        `${auth.currentUser.uid}/${book.id}/cover.jpg`
      );
      const coverUrl = await getDownloadURL(coverRef);
      if (coverUrl) {
        setImage(coverUrl);
      } else {
        setImage(DEFAULT_IMAGE);
      }
    } catch (err) {
      if (err.message.includes("storage/object-not-found")) {
        setImage(DEFAULT_IMAGE);
      } else {
        console.log("Error getting image:", err);
      }
    }
  };

  useEffect(() => {
    getImage();
  }, []);

  useEffect(() => {
    if (staleBookImage) {
      getImage().then(() => setStaleBookImage(""));
    }
  }, [staleBookImage]);

  return (
    <TouchableOpacity
      style={styles.book}
      onPress={() => navigation.navigate("BookDetails", { book })}
    >
      <View style={{ marginRight: 10 }}>
        {!!image ? (
          <Image style={styles.image} source={{ uri: image }} />
        ) : (
          <View style={styles.image}></View>
        )}
      </View>
      <View>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>
        {book.finished ? (
          <Text style={styles.author}>
            Finished on {book.finished.toDate().toDateString()}
          </Text>
        ) : (
          <Text style={styles.author}>
            Started on {book.started.toDate().toDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  book: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  image: {
    height: 90,
    width: 60,
    resizeMode: "cover",
    borderRadius: 10,
  },
  author: {
    fontSize: 12,
    color: "grey",
  },
  title: {
    fontSize: 20,
    fontWeight: "400",
  },
});
