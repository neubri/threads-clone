import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
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

const GET_POST_BY_ID = gql`
  query GetPostById($postId: ID) {
    getPostById(postId: $postId) {
      _id
      content
      tags
      imgUrl
      authorDetails {
        _id
        username
      }
      comments {
        content
        username
        createdAt
      }
      likes {
        username
      }
      createdAt
    }
  }
`;

const ADD_LIKE = gql`
  mutation AddLike($id: ID) {
    addLike(_id: $id) {
      username
      createdAt
      updatedAt
    }
  }
`;

const ADD_COMMENT = gql`
  mutation Mutation($id: ID, $content: String) {
    addComment(_id: $id, content: $content) {
      content
      username
      createdAt
      updatedAt
    }
  }
`;

export function PostDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  const [currentUsername, setCurrentUsername] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_POST_BY_ID, {
    variables: { postId },
  });

  const [addLike] = useMutation(ADD_LIKE, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Like error:", error);
      showErrorAlert(`Failed to like post: ${error.message}`);
    },
  });

  const [addComment] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      setCommentText("");
      refetch();
    },
    onError: (error) => {
      console.error("Comment error:", error);
      showErrorAlert(`Failed to add comment: ${error.message}`);
    },
  });

  // Get current username from token
  useEffect(() => {
    const getCurrentUsername = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setCurrentUsername(decoded.username);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        showErrorAlert("Session error. Please log in again.");
      }
    };
    getCurrentUsername();
  }, []);

  // Check if current user has liked the post
  useEffect(() => {
    if (data?.getPostById?.likes && currentUsername) {
      const hasLiked = data.getPostById.likes.some(
        (like) => like.username === currentUsername
      );
      setIsLiked(hasLiked);
    }
  }, [data, currentUsername]);

  const formatTime = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleLike = async () => {
    if (isLiked) {
      return; // Don't like if already liked
    }

    try {
      await addLike({ variables: { id: postId } });
    } catch (error) {
      console.error("Error liking post:", error);
      showErrorAlert(`Failed to like post: ${error.message}`);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      showErrorAlert("Please enter a comment before submitting.");
      return; // Don't submit empty comment
    }

    try {
      await addComment({
        variables: {
          id: postId,
          content: commentText.trim(),
        },
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      showErrorAlert(`Failed to add comment: ${error.message}`);
    }
  };

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
        <Text style={styles.errorText}>
          Error loading post: {error.message}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            refetch().catch((err) => {
              showErrorAlert(`Failed to reload post: ${err.message}`);
            });
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const post = data?.getPostById;
  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thread</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Post */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${post.authorDetails.username}&background=random`,
              }}
              style={styles.postAvatar}
            />
            <View style={styles.postUserInfo}>
              <Text style={styles.postUsername}>
                @{post.authorDetails.username}
              </Text>
              <Text style={styles.postTime}>
                · {formatTime(post.createdAt)}
              </Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  #{tag.replace("#", "")}
                </Text>
              ))}
            </View>
          )}

          {/* Image if exists */}
          {post.imgUrl && (
            <Image
              source={{ uri: post.imgUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          {/* Action Buttons with counters */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#ff4444" : "#888"}
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {post.likes?.length || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#888" />
              <Text style={styles.actionText}>
                {post.comments?.length || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="repeat-outline" size={20} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="send-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Replies</Text>
          {post.comments?.length > 0 ? (
            <FlatList
              data={post.comments}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.commentContainer}>
                  <Image
                    source={{
                      uri: `https://ui-avatars.com/api/?name=${item.username}&background=random`,
                    }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUsername}>
                        @{item.username}
                      </Text>
                      <Text style={styles.commentTime}>
                        · {formatTime(item.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noCommentsText}>No comments yet</Text>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          placeholder="Reply to this thread..."
          placeholderTextColor="#888"
          multiline
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !commentText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleComment}
          disabled={!commentText.trim()}
        >
          <Text
            style={[
              styles.sendButtonText,
              !commentText.trim() && styles.sendButtonTextDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "red",
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
  content: {
    flex: 1,
  },
  postContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  postUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  postUsername: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
    marginRight: 6,
  },
  postTime: {
    color: "#888",
    fontSize: 16,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    color: "#fff",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    color: "#1DA1F2",
    fontSize: 14,
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#222",
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
  likedText: {
    color: "#ff4444",
  },
  commentsSection: {
    flex: 1,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  noCommentsText: {
    color: "#888",
    fontSize: 14,
    padding: 16,
    textAlign: "center",
  },
  commentContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  commentUsername: {
    fontWeight: "600",
    color: "#fff",
    marginRight: 6,
  },
  commentTime: {
    color: "#888",
    fontSize: 14,
    marginRight: 6,
  },
  commentText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  commentInput: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#222",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    color: "#fff",
    backgroundColor: "#111",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#333",
  },
  sendButtonText: {
    color: "#000",
    fontWeight: "600",
  },
  sendButtonTextDisabled: {
    color: "#888",
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
