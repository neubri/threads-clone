import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import { gql, useLazyQuery } from "@apollo/client";
import * as SecureStore from "expo-secure-store";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { showErrorAlert, showSuccessAlert } from "../utils/errorHandler";

const LOGIN = gql`
  query Query($email: String, $password: String) {
    login(email: $email, password: $password)
  }
`;

export function LoginScreen() {
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [loginFn, { loading, error }] = useLazyQuery(LOGIN, {
    onCompleted: function (result) {
      SecureStore.setItem("access_token", result.login);
      authContext.setIsSignedIn(true);
      showSuccessAlert("Login successful!");
    },
    onError: function (error) {
      showErrorAlert(error, "Login Failed");
    },
  });

  const handleChange = (text, key) => {
    setInput({
      ...input,
      [key]: text,
    });
  };

  const handleLogin = () => {
    if (!input.email.trim() || !input.password.trim()) {
      showErrorAlert(
        new Error("Please fill in all fields"),
        "Validation Error"
      );
      return;
    }

    loginFn({
      variables: {
        email: input.email,
        password: input.password,
      },
    });
  };

  if (error) {
    // Error will be handled by onError callback, just show loading state
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in to Threads</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={input.email}
          onChangeText={(text) => handleChange(text, "email")}
          placeholder="Enter your email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={input.password}
          onChangeText={(text) => handleChange(text, "password")}
          placeholder="Enter your password"
          placeholderTextColor="#777"
          secureTextEntry={true}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchAuthContainer}
          onPress={() => navigation.navigate("RegisterScreen")}
          disabled={loading}
        >
          <Text style={styles.switchAuthText}>Don't have an account? </Text>
          <Text
            style={[
              styles.switchAuthText,
              { color: "#fff", fontWeight: "600" },
            ]}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#fff",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#111",
    color: "#fff",
  },
  button: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginVertical: 20,
    height: 50, // Fixed height for consistent button size
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  switchAuthContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  switchAuthText: {
    color: "#777",
    textAlign: "center",
  },
});
