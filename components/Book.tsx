import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useBookImage } from "../hooks/useBookImage";
import { TBook } from "../types";
import { dateLocaleStringOptions } from "../utils";
import { Text, View } from "./Themed";

interface BookProps {
  book: TBook;
}

export const Book = (props: BookProps) => {
  const { book } = props;
  const navigation = useNavigation();
  const image = useBookImage(book.id, true);

  const truncate = (s: string): string => {
    const MAX_LENGTH = 30;
    return s.length > MAX_LENGTH ? s.slice(0, MAX_LENGTH).concat("...") : s;
  };

  let timeline = "";

  if (book.started && book.finished) {
    timeline = book.started
      .toDate()
      .toLocaleString([], dateLocaleStringOptions)
      .concat(" - ")
      .concat(
        book.finished.toDate().toLocaleString([], dateLocaleStringOptions)
      );
  } else if (book.started) {
    timeline = `Started: ${book.started
      .toDate()
      .toLocaleString([], dateLocaleStringOptions)}`;
  }

  return (
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
        <Text style={styles.date}>{timeline}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  book: {
    flex: 1,
    flexDirection: "row",
    borderBottomColor: "grey",
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
});
