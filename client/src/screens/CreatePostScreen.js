import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { gql, useMutation } from "@apollo/client";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { showErrorAlert, showSuccessAlert } from "../utils/errorHandler";

const GET_POSTS = gql`
  query GetPosts {
    getPosts {
      _id
      content
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
      updatedAt
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($content: String, $tags: [String], $imgUrl: String) {
    createPost(content: $content, tags: $tags, imgUrl: $imgUrl) {
      _id
      content
      tags
      imgUrl
      authorId
      createdAt
      updatedAt
    }
  }
`;

export function CreatePostScreen() {
  const navigation = useNavigation();
  const [postContent, setPostContent] = useState("");
  const [tags, setTags] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      Alert.alert("Success", "Post created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Clear form
            setPostContent("");
            setTags("");
            setImgUrl("");
            navigation.goBack();
          },
        },
      ]);
    },
    onError: (error) => {
      console.error("Create post error:", error);
      showErrorAlert(`Failed to create post: ${error.message}`);
    },
  });

  // Get current user from token
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setCurrentUser({
            id: decoded.id || decoded.userId || decoded.sub,
            username: decoded.username,
            name: decoded.name || decoded.username,
          });
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        showErrorAlert("Session error. Please log in again.");
      }
    };
    getCurrentUser();
  }, []);

  const handlePost = async () => {
    if (!postContent.trim()) {
      showErrorAlert("Please write something before posting.");
      return;
    }

    try {
      // Parse tags from content or tags input
      const tagsArray = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      await createPost({
        variables: {
          content: postContent.trim(),
          tags: tagsArray.length > 0 ? tagsArray : null,
          imgUrl: imgUrl.trim() || null,
        },
      });
    } catch (error) {
      console.error("Error creating post:", error);
      showErrorAlert(`Failed to create post: ${error.message}`);
    }
  };

  const userProfile = {
    name: currentUser?.name || "User",
    username: currentUser?.username || "username",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      currentUser?.name || "User"
    )}&background=666&color=fff&size=50`,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Thread</Text>
        <TouchableOpacity
          style={[
            styles.postButton,
            (!postContent.trim() || loading) && styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!postContent.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text
              style={[
                styles.postButtonText,
                (!postContent.trim() || loading) &&
                  styles.postButtonTextDisabled,
              ]}
            >
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.userSection}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userUsername}>@{userProfile.username}</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder="What's happening?"
            placeholderTextColor="#888"
            multiline
            value={postContent}
            onChangeText={setPostContent}
            autoFocus
          />
        </View>

        {/* Tags Input */}
        <View style={styles.tagsSection}>
          <Text style={styles.inputLabel}>Tags (optional)</Text>
          <TextInput
            style={styles.tagsInput}
            placeholder="Enter tags separated by commas (e.g. technology, news)"
            placeholderTextColor="#888"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Image URL Input */}
        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Image URL (optional)</Text>
          <TextInput
            style={styles.imageInput}
            placeholder="Enter image URL"
            placeholderTextColor="#888"
            value={imgUrl}
            onChangeText={setImgUrl}
          />
        </View>

        {/* Attachment Options */}
        <View style={styles.attachmentOptions}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="image-outline" size={24} color="#888" />
            <Text style={styles.attachmentText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="videocam-outline" size={24} color="#888" />
            <Text style={styles.attachmentText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="link-outline" size={24} color="#888" />
            <Text style={styles.attachmentText}>Link</Text>
          </TouchableOpacity>
        </View>

        {/* Character Count */}
        <View style={styles.characterCount}>
          <Text style={styles.characterCountText}>
            {postContent.length}/500
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  postButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonDisabled: {
    backgroundColor: "#333",
  },
  postButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  postButtonTextDisabled: {
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
    marginBottom: 2,
  },
  userUsername: {
    color: "#888",
    fontSize: 14,
  },
  inputSection: {
    flex: 1,
    marginBottom: 20,
  },
  textInput: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 24,
    textAlignVertical: "top",
    minHeight: 200,
  },
  inputLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
  },
  tagsSection: {
    marginBottom: 16,
  },
  tagsInput: {
    fontSize: 16,
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 8,
  },
  imageSection: {
    marginBottom: 16,
  },
  imageInput: {
    fontSize: 16,
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingVertical: 8,
  },
  attachmentOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#222",
    marginBottom: 20,
  },
  attachmentButton: {
    alignItems: "center",
    padding: 10,
  },
  attachmentText: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    alignItems: "flex-end",
  },
  characterCountText: {
    color: "#888",
    fontSize: 14,
  },
});
