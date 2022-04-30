import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { TBook } from "../types";
import { View, Text } from "./Themed";
import { useNavigation } from "@react-navigation/native";
import { useBookImage } from "../hooks/useBookImage";

interface BookProps {
  book: TBook;
}

export const Book = (props: BookProps) => {
  const { book } = props;
  const navigation = useNavigation();
  const image = useBookImage(book.id, true);

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
        style={{ display: "flex", flex: 1, justifyContent: "space-between" }}
      >
        <View>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
        </View>
        {book.finished ? (
          <Text style={styles.date}>
            Finished: {book.finished.toDate().toDateString()}
          </Text>
        ) : (
          <Text style={styles.date}>
            Started: {book.started.toDate().toDateString()}
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
    marginHorizontal: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  image: {
    height: 80,
    width: 80,
    //height: 90,
    //width: 60,
    resizeMode: "cover",
    borderRadius: 5,
  },
  author: {
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "400",
  },
});
