import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Button,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import * as SecureStore from "expo-secure-store";
import { gql, useQuery } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { showErrorAlert } from "../utils/errorHandler";

const GET_USER_BY_ID = gql`
  query GetUserById($userId: ID) {
    getUserById(userId: $userId) {
      _id
      name
      username
      email
      followers {
        _id
        name
        username
      }
      following {
        _id
        name
        username
      }
    }
  }
`;

export function ProfileScreen() {
  const authContext = useContext(AuthContext);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from token
  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setCurrentUserId(decoded.id || decoded.userId || decoded.sub);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        showErrorAlert("Session error. Please log in again.");
      }
    };
    getUserId();
  }, []);

  const { data, loading, error, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { userId: currentUserId },
    skip: !currentUserId, // Skip query if no userId
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    authContext.setIsSignedIn(false);
  };

  const user = data?.getUserById;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1a8cd8" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error loading profile</Text>
        <Text style={styles.errorSubText}>{error.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            refetch().catch((err) => {
              showErrorAlert(`Failed to reload profile: ${err.message}`);
            });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>User not found</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}&background=666&color=fff&size=60`,
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user.name || "User"}</Text>
            <Text style={styles.profileUsername}>
              @{user.username || "username"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.bioContainer}>
        <Text style={styles.bio}>{user.email || "No bio available"}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.followers?.length || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.following?.length || 0}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#ff4444" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#333",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: "#888",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  bioContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  bio: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
  },
  logoutContainer: {
    padding: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#1DA1F2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
