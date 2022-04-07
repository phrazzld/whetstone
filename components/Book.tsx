import { StyleSheet, TouchableOpacity } from "react-native";
import { TBook } from "../types";
import { Text } from "./Themed";
import { useNavigation } from "@react-navigation/native";

interface BookProps {
  book: TBook;
}

export const Book = (props: BookProps) => {
  const { book } = props;
  const navigation = useNavigation();

  console.log("book:", book);

  return (
    <TouchableOpacity
      style={styles.book}
      onPress={() => navigation.navigate("BookDetails", { book })}
    >
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  book: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
  },
  author: {
    fontSize: 12,
    color: "grey",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
