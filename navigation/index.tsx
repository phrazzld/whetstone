/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { ColorSchemeName, Pressable } from "react-native";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import NotFoundScreen from "../screens/NotFoundScreen";
import ReadingScreen from "../screens/ReadingScreen";
import JourneyScreen from "../screens/JourneyScreen";
import { RootStackParamList, RootTabParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";
import { BookDetailsScreen } from "../screens/BookDetailsScreen";
import { AddBookScreen } from "../screens/AddBookScreen";
import { AddNoteScreen } from "../screens/AddNoteScreen";
import { SignInScreen } from "../screens/SignInScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ProfileScreen } from "../screens/ProfileScreen";

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
  const [user, setUser] = React.useState<any>();

  onAuthStateChanged(auth, (u) => {
    if (u) {
      console.log("user is signed in, TODO set in app state", u);
    } else {
      console.log("user is signed out");
    }
    setUser(u);
  });

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
              component={AddBookScreen}
              options={{ title: "Add Book" }}
            />
            <Stack.Screen
              name="AddNote"
              component={AddNoteScreen}
              options={{ title: "Add Note" }}
            />
          </Stack.Group>
        </>
      ) : (
        <>
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
        </>
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
      initialRouteName="ReadingStack"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
      }}
    >
      <BottomTab.Screen
        name="ReadingStack"
        component={ReadingStackScreen}
        options={{
          title: "Reading",
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="JourneyStack"
        component={JourneyStackScreen}
        options={{
          title: "Journey",
          tabBarIcon: ({ color }) => <TabBarIcon name="map-o" color={color} />,
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

const ReadingStack = createNativeStackNavigator();

function ReadingStackScreen({ navigation }) {
  return (
    <ReadingStack.Navigator>
      <ReadingStack.Screen
        name="Reading"
        component={ReadingScreen}
        options={{
          title: "Reading",
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
                color={Colors.text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        }}
      />
      <ReadingStack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={({ route }) => ({ title: route.params.book.title })}
      />
    </ReadingStack.Navigator>
  );
}

const JourneyStack = createNativeStackNavigator();

function JourneyStackScreen({ navigation }) {
  return (
    <JourneyStack.Navigator>
      <JourneyStack.Screen
        name="Journey"
        component={JourneyScreen}
        options={{
          title: "Journey",
          headerRight: () => <></>,
        }}
      />
    </JourneyStack.Navigator>
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
