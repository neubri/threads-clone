import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { gql, useLazyQuery } from "@apollo/client";
import { useState, useEffect, useRef, useCallback } from "react";
import { showErrorAlert } from "../utils/errorHandler";

const SEARCH_USERS = gql`
  query Query($username: String) {
    getUserByName(username: $username) {
      _id
      name
      username
    }
  }
`;

export function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [searchUsers, { loading, error, data }] = useLazyQuery(SEARCH_USERS);
  const flatListRef = useRef(null);

  // Memoized user press handler
  const handleUserPress = useCallback(
    (user) => {
      navigation.navigate("UserDetail", { userId: user._id });
    },
    [navigation]
  );

  // Debounce implementation with cleanup
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers({ variables: { username: searchQuery } });
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      } else {
        setDisplayedUsers([]);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery, searchUsers]);

  // Update displayed users when data changes
  useEffect(() => {
    if (data) {
      setDisplayedUsers(data.getUserByName || []);
    }
  }, [data]);

  // Render user item with memoization
  const renderUserItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.userContainer}
        onPress={() => handleUserPress(item)}
      >
        <Image
          source={{
            uri: `https://ui-avatars.com/api/?name=${item.username}&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    ),
    [handleUserPress]
  );

  // Empty component with better visual feedback
  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={48} color="#888" />
        <Text style={styles.emptyText}>
          {searchQuery ? "No users found" : "Search for users"}
        </Text>
      </View>
    ),
    [searchQuery]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1DA1F2" />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error searching users</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (searchQuery.trim()) {
                searchUsers({ variables: { username: searchQuery } }).catch(
                  (err) => {
                    showErrorAlert(`Failed to search users: ${err.message}`);
                  }
                );
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={displayedUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    marginTop: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  userContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
    marginBottom: 2,
  },
  username: {
    color: "#888",
    fontSize: 14,
    marginBottom: 4,
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
