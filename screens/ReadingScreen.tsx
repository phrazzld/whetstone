import { StyleSheet } from "react-native";
import { Book } from "../components/Book";
import { View } from "../components/Themed";
import { RootTabScreenProps, TBook } from "../types";

const books: Array<TBook> = [
    {
        id: 1,
        title: "Bitcoin is Venice",
        author: "Allen Farrington & Sacha Meyers",
    },
    {
        id: 2,
        title: "Human Action",
        author: "Ludwig von Mises",
    },
    {
        id: 3,
        title: "Discourses, Fragments, Handbook",
        author: "Epictetus",
    },
    {
        id: 4,
        title: "Ghost in the Shell",
        author: "Masamune Shirow",
    },
];
export default function ReadingScreen({
    navigation,
}: RootTabScreenProps<"Reading">) {
    return (
        <View style={styles.container}>
            {books.map((book) => (
                <Book key={book.id} book={book} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
