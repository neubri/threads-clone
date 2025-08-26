import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ActivityScreen } from "../screens/ActivityScreen";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const Tab = createBottomTabNavigator();

function ThreadsHeader() {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity>
        <Text style={styles.headerLogo}>@</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#222",
          paddingVertical: 8,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#888",
        tabBarShowLabel: false,
        header: () => <ThreadsHeader />,
        headerStyle: {
          backgroundColor: "#000",
          borderBottomColor: "#222",
          borderBottomWidth: 1,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={HomeScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate("CreatePost");
          },
        })}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-box" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#000",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    alignItems: "center",
  },
  headerLogo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
