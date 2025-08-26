import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StackNavigator from "./src/navigators/StackNavigator";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { useEffect, useState } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./src/config/apollo";
import AuthContext from "./src/contexts/AuthContext";
import * as SecureStore from "expo-secure-store";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      setIsSignedIn(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        setIsSignedIn,
      }}
    >
      <ApolloProvider client={client}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="LoginScreen"
            screenOptions={{ headerShown: false }}
          >
            {isSignedIn ? (
              <>
                <Stack.Screen
                  name="StackNavigator"
                  component={StackNavigator}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="RegisterScreen"
                  component={RegisterScreen}
                />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ApolloProvider>
    </AuthContext.Provider>
  );
}
