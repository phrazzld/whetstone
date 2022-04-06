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

  return (
    <TouchableOpacity
      style={styles.book}
      onPress={() => navigation.navigate("BookDetails", { book })}
    >
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>
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
