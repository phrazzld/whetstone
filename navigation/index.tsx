/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, ColorSchemeName, Pressable } from "react-native";
import { FontAwesome } from "../components/Themed";
import Colors from "../constants/Colors";
import { auth } from "../firebase";
import useColorScheme from "../hooks/useColorScheme";
import { BookDetailsScreen } from "../screens/BookDetailsScreen";
import BooksScreen from "../screens/BooksScreen";
import { EditBookScreen } from "../screens/EditBookScreen";
import { EditNoteScreen } from "../screens/EditNoteScreen";
import { EditVocabScreen } from "../screens/EditVocabScreen";
import { ManageReadingDatesScreen } from "../screens/ManageReadingDatesScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import {
  BookStackParamList,
  RootStackParamList,
  RootTabParamList,
} from "../types";
import LinkingConfiguration from "./LinkingConfiguration";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(true);

  onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
  });

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="Root"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotFound"
            component={NotFoundScreen}
            options={{ title: "Oops!" }}
          />
          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen
              name="AddBook"
              component={EditBookScreen}
              options={{ title: "Add Book" }}
            />
            <Stack.Screen
              name="EditBook"
              component={EditBookScreen}
              options={{ title: "Edit Book" }}
            />
            <Stack.Screen
              name="AddNote"
              component={EditNoteScreen}
              options={{ title: "Add Note" }}
            />
            <Stack.Screen
              name="EditNote"
              component={EditNoteScreen}
              options={{ title: "Edit Note" }}
            />
            <Stack.Screen
              name="AddVocab"
              component={EditVocabScreen}
              options={{ title: "Add Vocab" }}
            />
            <Stack.Screen
              name="EditVocab"
              component={EditVocabScreen}
              options={{ title: "Edit Vocab" }}
            />
            <Stack.Screen
              name="ManageReadingDates"
              component={ManageReadingDatesScreen}
              options={{ title: "Manage Reading Dates" }}
            />
          </Stack.Group>
        </>
      ) : (
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="BookStack"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
      }}
    >
      <BottomTab.Screen
        name="BookStack"
        component={BookStackScreen}
        options={{
          title: "Books",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: true,
        }}
      />
    </BottomTab.Navigator>
  );
}

const BookStack = createNativeStackNavigator<BookStackParamList>();

function BookStackScreen({ navigation }: { navigation: any }) {
  const colorScheme = useColorScheme();

  return (
    <BookStack.Navigator>
      <BookStack.Screen
        name="Books"
        component={BooksScreen}
        options={{
          title: "Books",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("AddBook")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <FontAwesome
                name="plus-square-o"
                size={25}
                color={Colors[colorScheme].tabIconSelected}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        }}
      />
      <BookStack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={({ route }) => ({
          title: route.params.book.title,
        })}
      />
    </BookStack.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
