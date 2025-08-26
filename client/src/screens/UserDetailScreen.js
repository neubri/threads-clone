import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { showErrorAlert } from "../utils/errorHandler";

const GET_USER_BY_ID = gql`
  query Query($userId: ID) {
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

const FOLLOW_USER = gql`
  mutation FollowUser($followingId: ID) {
    followUser(followingId: $followingId) {
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;

export function UserDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from token
  useEffect(() => {
    const getCurrentUserId = async () => {
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
    getCurrentUserId();
  }, []);

  const { loading, error, data, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { userId },
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    refetchQueries: [
      { query: GET_USER_BY_ID, variables: { userId } }, // Refetch target user
      { query: GET_USER_BY_ID, variables: { userId: currentUserId } }, // Refetch current user (ProfileScreen)
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      refetch();
      setIsFollowing(true); // Update local state immediately
      console.log("Follow successful!");
    },
    onError: (error) => {
      console.error("Follow error:", error);
      if (error.graphQLErrors?.length > 0) {
        const message = error.graphQLErrors[0].message;
        console.error("GraphQL Error:", message);
        if (message.includes("already follow")) {
          setIsFollowing(true); // Update state if already following
          showErrorAlert("You are already following this user");
        } else {
          showErrorAlert(`Failed to follow user: ${message}`);
        }
      } else {
        showErrorAlert(`Failed to follow user: ${error.message}`);
      }
    },
  });

  const user = data?.getUserById;

  // Check initial follow status
  useEffect(() => {
    if (user?.followers && currentUserId) {
      setIsFollowing(
        user.followers.some((follower) => follower._id === currentUserId)
      );
    }
  }, [user, currentUserId]);

  const handleFollow = async () => {
    if (isFollowing) {
      console.log("Already following this user");
      showErrorAlert("You are already following this user");
      return; // Don't follow if already following
    }

    if (!userId) {
      console.error("User ID not available");
      showErrorAlert("Unable to follow: User ID not available");
      return;
    }

    // Prevent self-follow
    if (userId === currentUserId) {
      console.log("Cannot follow yourself");
      showErrorAlert("You cannot follow yourself");
      return;
    }

    console.log("Attempting to follow user:", userId);
    console.log("Current user ID:", currentUserId);
    console.log("User data:", user);

    try {
      setIsFollowing(true); // Optimistic update
      const result = await followUser({
        variables: {
          followingId: userId,
        },
      });
      console.log("Follow result:", result);
    } catch (error) {
      setIsFollowing(false); // Revert optimistic update on error
      console.error("Error following user:", error);
      if (error.graphQLErrors?.length > 0) {
        console.error("GraphQL Error:", error.graphQLErrors[0].message);
        showErrorAlert(
          `Failed to follow user: ${error.graphQLErrors[0].message}`
        );
      } else if (error.networkError) {
        console.error("Network error:", error.networkError);
        showErrorAlert(
          "Network error. Please check your connection and try again."
        );
      } else {
        showErrorAlert(`Failed to follow user: ${error.message}`);
      }
    }
  };

  const renderFollowerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.followerItem}
      onPress={() => navigation.navigate("UserDetail", { userId: item._id })}
    >
      <Image
        source={{
          uri: `https://ui-avatars.com/api/?name=${item.name}&background=random`,
        }}
        style={styles.followerAvatar}
      />
      <View>
        <Text style={styles.followerName}>{item.name}</Text>
        <Text style={styles.followerUsername}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading user data</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            refetch().catch((err) => {
              showErrorAlert(`Failed to reload user data: ${err.message}`);
            });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user?.name || "Profile"}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${
                user?.name || "U"
              }&background=random`,
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user?.name || "User"}</Text>
            <Text style={styles.profileUsername}>
              @{user?.username || "username"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={isFollowing ? styles.unfollowButton : styles.followButton}
          onPress={handleFollow}
        >
          <Text
            style={
              isFollowing ? styles.unfollowButtonText : styles.followButtonText
            }
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.bioContainer}>
        <Text style={styles.bio}>{user?.email || "No bio available"}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.followers?.length || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.following?.length || 0}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Followers Section */}
      {user?.followers?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Followers</Text>
          <FlatList
            data={user.followers}
            renderItem={renderFollowerItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.followersList}
          />
        </View>
      )}

      {/* Following Section */}
      {user?.following?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Following</Text>
          <FlatList
            data={user.following}
            renderItem={renderFollowerItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.followersList}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
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
  followButton: {
    backgroundColor: "#1DA1F2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  unfollowButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unfollowButtonText: {
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  followersList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    padding: 8,
    backgroundColor: "#111",
    borderRadius: 8,
  },
  followerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  followerName: {
    color: "#fff",
    fontWeight: "bold",
  },
  followerUsername: {
    color: "#888",
    fontSize: 12,
  },
  retryButton: {
    backgroundColor: "#1DA1F2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
