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
