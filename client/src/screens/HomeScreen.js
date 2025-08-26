import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { showErrorAlert } from "../utils/errorHandler";

const GET_POSTS = gql`
  query GetPosts {
    getPosts {
      _id
      content
      tags
      imgUrl
      authorDetails {
        username
      }
      comments {
        username
      }
      likes {
        username
      }
      createdAt
    }
  }
`;

export function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_POSTS);

  const formatTime = (timestamp) => {
    const now = new Date();
    const postDate = new Date(parseInt(timestamp));
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return postDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      showErrorAlert(err, "Refresh Failed");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (error) {
    showErrorAlert(error, "Loading Posts Failed");
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading posts</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const threads = data?.getPosts?.map((post) => ({
    id: post._id,
    username: post.authorDetails.username,
    content: post.content,
    tags: post.tags || [],
    likes: post.likes?.length || 0,
    replies: post.comments?.length || 0,
    time: formatTime(post.createdAt),
    avatar: `https://ui-avatars.com/api/?name=${post.authorDetails.username}&background=random`,
    imgUrl: post.imgUrl,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <Text style={styles.activeTab}>For you</Text>
          <Text style={styles.inactiveTab}>Following</Text>
        </View>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#1DA1F2"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadContainer}
            onPress={() =>
              navigation.navigate("PostDetail", { postId: item.id })
            }
          >
            <View style={styles.threadHeader}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.time}>· {item.time}</Text>
              </View>
            </View>

            <Text style={styles.content}>{item.content}</Text>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                  <Text key={index} style={styles.hashtag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            )}

            {item.imgUrl && (
              <Image
                source={{ uri: item.imgUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={16} color="#888" />
                <Text style={styles.actionText}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={16} color="#888" />
                <Text style={styles.actionText}>{item.replies}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  retryText: {
    color: "#1DA1F2",
    fontSize: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
  },
  activeTab: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  inactiveTab: {
    fontSize: 16,
    color: "#888",
  },
  listContent: {
    paddingBottom: 20,
  },
  threadContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  threadHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
    marginRight: 6,
  },
  time: {
    color: "#888",
    fontSize: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    color: "#fff",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  hashtag: {
    color: "#1DA1F2",
    fontSize: 14,
    fontWeight: "500",
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 20,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: "#888",
    fontSize: 14,
  },
});
