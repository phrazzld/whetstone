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
    const MAX_LENGTH = 35;
    return s.length > MAX_LENGTH ? s.slice(0, MAX_LENGTH).concat("...") : s;
  };

  const timeline = book.finished
    ? book.started
        .toDate()
        .toLocaleString([], dateLocaleStringOptions)
        .concat(" - ")
        .concat(
          book.finished.toDate().toLocaleString([], dateLocaleStringOptions)
        )
    : `Started: ${book.started
        .toDate()
        .toLocaleString([], dateLocaleStringOptions)}`;

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
      <View
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
          paddingVertical: 5,
        }}
      >
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
  image: {
    height: 80,
    width: 80,
    resizeMode: "cover",
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
