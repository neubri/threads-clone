import { Alert } from "react-native";

export const showErrorAlert = (error, title = "Error") => {
  let message = "Something went wrong. Please try again.";

  if (error?.message) {
    message = error.message;
  } else if (error?.graphQLErrors?.length > 0) {
    message = error.graphQLErrors[0].message;
  } else if (error?.networkError) {
    message = "Network error. Please check your connection.";
  }

  Alert.alert(title, message, [
    {
      text: "OK",
      style: "default",
    },
  ]);
};

export const showSuccessAlert = (message, title = "Success") => {
  Alert.alert(title, message, [
    {
      text: "OK",
      style: "default",
    },
  ]);
};

export const showConfirmAlert = (message, onConfirm, title = "Confirm") => {
  Alert.alert(title, message, [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "OK",
      onPress: onConfirm,
      style: "default",
    },
  ]);
};
