import { StyleSheet } from "react-native";
import { TBook } from "../types";
import { Text, View } from "./Themed";

interface BookProps {
    book: TBook;
}

export const Book = (props: BookProps) => {
    const { book } = props;

    return (
        <View style={styles.book}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
        </View>
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
