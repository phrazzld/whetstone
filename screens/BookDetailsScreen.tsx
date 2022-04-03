import { StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { useRoute } from "@react-navigation/native";

interface BookDetailsScreenProps {}

export const BookDetailsScreen = (props: BookDetailsScreenProps) => {
    const { book } = useRoute().params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    author: {
        fontSize: 16,
        color: "grey",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
});
