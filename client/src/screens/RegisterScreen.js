import { gql, useMutation } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { showErrorAlert, showSuccessAlert } from "../utils/errorHandler";

const REGISTER = gql`
  mutation Register($newUser: RegisterInput) {
    register(newUser: $newUser)
  }
`;

export function RegisterScreen() {
  const navigation = useNavigation();
  const [input, setInput] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [registerFn, { loading, error }] = useMutation(REGISTER, {
    onCompleted: () => {
      showSuccessAlert("Registration successful! Please login.", "Success");
      navigation.navigate("LoginScreen");
    },
    onError: (error) => {
      showErrorAlert(error, "Registration Failed");
    },
  });

  const handleChange = (text, key) => {
    setInput({
      ...input,
      [key]: text,
    });
  };

  const handleRegister = () => {
    // Validation
    if (
      !input.name.trim() ||
      !input.username.trim() ||
      !input.email.trim() ||
      !input.password.trim()
    ) {
      showErrorAlert(
        new Error("Please fill in all fields"),
        "Validation Error"
      );
      return;
    }

    if (input.password.length < 6) {
      showErrorAlert(
        new Error("Password must be at least 6 characters"),
        "Validation Error"
      );
      return;
    }

    registerFn({
      variables: {
        newUser: {
          name: input.name,
          username: input.username,
          email: input.email,
          password: input.password,
        },
      },
    });
  };

  if (error) {
    // Error will be handled by onError callback
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={input.name}
          onChangeText={(text) => handleChange(text, "name")}
          placeholder="Enter your full name"
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={input.username}
          onChangeText={(text) => handleChange(text, "username")}
          placeholder="Choose a username"
          placeholderTextColor="#777"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={input.email}
          onChangeText={(text) => handleChange(text, "email")}
          placeholder="Enter your email"
          placeholderTextColor="#777"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={input.password}
          onChangeText={(text) => handleChange(text, "password")}
          placeholder="Create a password"
          placeholderTextColor="#777"
          secureTextEntry={true}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Sign up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchAuthContainer}
          onPress={() => navigation.navigate("LoginScreen")}
          disabled={loading}
        >
          <Text style={styles.switchAuthText}>Already have an account? </Text>
          <Text
            style={[
              styles.switchAuthText,
              { color: "#fff", fontWeight: "600" },
            ]}
          >
            Log in
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
