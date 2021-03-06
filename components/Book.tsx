import { useNavigation } from "@react-navigation/native";
import { deleteObject, ref } from "firebase/storage";
import { useRef } from "react";
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { palette } from "../constants/Colors";
import { auth, deleteBook, storage } from "../firebase";
import { useBookImage } from "../hooks/useBookImage";
import { TBook } from "../types";
import { formatReadDates } from "../utils";
import { FontAwesome, Text, View } from "./Themed";

interface BookProps {
  book: TBook;
}

export const Book = (props: BookProps) => {
  const { book } = props;
  const navigation = useNavigation();
  const image = useBookImage(book.id, true);
  const swipeableRef = useRef<Swipeable | null>(null);

  const truncate = (s: string): string => {
    const MAX_LENGTH = 30;
    return s.length > MAX_LENGTH ? s.slice(0, MAX_LENGTH).concat("...") : s;
  };

  const editBook = (): void => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    navigation.navigate("EditBook", { book });
  };

  const removeBook = async (): Promise<void> => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!auth.currentUser) {
              throw new Error("Can't delete this book, no user is logged in.");
            }

            await deleteBook(book.id);
            const bookImageRef = ref(
              storage,
              `${auth.currentUser.uid}/${book.id}/cover.jpg`
            );
            deleteObject(bookImageRef)
              .then(() => {
                console.debug("Successfully deleted book image");
              })
              .catch((err) => {
                console.debug("Error deleting book image:", err);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderRightAction = (
    text: string,
    color: string,
    _x: number,
    _progress: any,
    pressHandler: any
  ): any => {
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          {text === "Delete" ? (
            <FontAwesome name="trash" size={25} color={palette.white} />
          ) : (
            <FontAwesome name="pencil" size={25} color={palette.white} />
          )}
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = (progress: any): any => (
    <View
      style={{
        width: "40%",
        flexDirection: "row",
        height: "100%",
        marginTop: "auto",
        marginBottom: "auto",
      }}
    >
      {renderRightAction("Edit", palette.orange, 128, progress, editBook)}
      {renderRightAction("Delete", palette.red, 64, progress, removeBook)}
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      ref={swipeableRef}
    >
      <TouchableOpacity
        style={styles.book}
        onPress={() => navigation.navigate("BookDetails", { book })}
      >
        <View style={styles.imageContainer}>
          {!!image ? (
            <Image style={styles.image} source={{ uri: image }} />
          ) : (
            <View style={styles.image}></View>
          )}
        </View>
        <View style={styles.bookDetails}>
          <View>
            <Text style={styles.title}>{truncate(book.title)}</Text>
            <Text style={styles.author}>{truncate(book.author)}</Text>
          </View>
          <Text style={styles.date}>{formatReadDates(book)}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  book: {
    flex: 1,
    flexDirection: "row",
    borderBottomColor: palette.grey,
    borderBottomWidth: 1,
  },
  bookDetails: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  image: {
    height: 80,
    width: 80,
    resizeMode: "cover",
  },
  imageContainer: {
    marginRight: 10,
  },
  author: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "400",
    marginRight: 5,
  },
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  actionText: {
    color: palette.white,
    backgroundColor: "transparent",
    padding: 10,
    fontSize: 15,
    fontWeight: "500",
  },
});
