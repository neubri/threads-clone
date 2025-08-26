import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export function ActivityScreen() {
  const navigation = useNavigation();

  // Data dummy untuk aktivitas
  const activities = [
    {
      id: "1",
      type: "like",
      user: {
        id: "user1",
        username: "johndoe",
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      time: "2h ago",
      post: {
        id: "post1",
        content: "Just launched my new app! Check it out...",
      },
    },
    {
      id: "2",
      type: "follow",
      user: {
        id: "user2",
        username: "janesmith",
        name: "Jane Smith",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      time: "4h ago",
    },
    {
      id: "3",
      type: "reply",
      user: {
        id: "user3",
        username: "devguy",
        name: "Mike Developer",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      },
      time: "6h ago",
      post: {
        id: "post2",
        content: "Working on a new React Native project...",
      },
      reply: "Great work! Looking forward to seeing it.",
    },
    {
      id: "4",
      type: "like",
      user: {
        id: "user4",
        username: "designergirl",
        name: "Sarah Designer",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      },
      time: "8h ago",
      post: {
        id: "post3",
        content: "Beautiful sunset from my office window...",
      },
    },
    {
      id: "5",
      type: "follow",
      user: {
        id: "user5",
        username: "codemaster",
        name: "Alex Code",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      },
      time: "1d ago",
    },
    {
      id: "6",
      type: "reply",
      user: {
        id: "user6",
        username: "techie",
        name: "Emma Tech",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      },
      time: "1d ago",
      post: {
        id: "post4",
        content: "Learning React Native has been amazing...",
      },
      reply: "Totally agree! React Native is fantastic for mobile development.",
    },
  ];

  const handleUserPress = (user) => {
    navigation.getParent()?.navigate("UserDetail", { user });
  };

  const handlePostPress = (post) => {
    navigation.getParent()?.navigate("PostDetail", { post });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "like":
        return <Ionicons name="heart" size={20} color="#ff3040" />;
      case "follow":
        return <Ionicons name="person-add" size={20} color="#0084ff" />;
      case "reply":
        return <MaterialIcons name="reply" size={20} color="#00ba7c" />;
      default:
        return <Ionicons name="notifications" size={20} color="#888" />;
    }
  };

  const getActivityText = (item) => {
    switch (item.type) {
      case "like":
        return "liked your post";
      case "follow":
        return "started following you";
      case "reply":
        return "replied to your post";
      default:
        return "interacted with your content";
    }
  };

  const renderActivity = ({ item }) => (
    <TouchableOpacity
      style={styles.activityContainer}
      onPress={() => {
        if (item.type === "follow") {
          handleUserPress(item.user);
        } else if (item.post) {
          handlePostPress(item.post);
        }
      }}
    >
      <TouchableOpacity onPress={() => handleUserPress(item.user)}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      </TouchableOpacity>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <View style={styles.activityIcon}>{getActivityIcon(item.type)}</View>
          <View style={styles.activityText}>
            <Text style={styles.activityDescription}>
              <Text style={styles.username}>{item.user.username}</Text>
              <Text style={styles.actionText}> {getActivityText(item)}</Text>
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>

        {item.post && (
          <View style={styles.postPreview}>
            <Text style={styles.postContent} numberOfLines={2}>
              {item.post.content}
            </Text>
          </View>
        )}

        {item.reply && (
          <View style={styles.replyPreview}>
            <Text style={styles.replyContent} numberOfLines={2}>
              "{item.reply}"
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  listContent: {
    paddingBottom: 20,
  },
  activityContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  activityIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  activityText: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  username: {
    fontWeight: "600",
    color: "#fff",
  },
  actionText: {
    color: "#ccc",
  },
  timeText: {
    fontSize: 13,
    color: "#888",
  },
  postPreview: {
    marginTop: 8,
    marginLeft: 28,
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#333",
  },
  postContent: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 18,
  },
  replyPreview: {
    marginTop: 8,
    marginLeft: 28,
    padding: 12,
    backgroundColor: "#0a1a0a",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00ba7c",
  },
  replyContent: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 18,
    fontStyle: "italic",
  },
  separator: {
    height: 1,
    backgroundColor: "#222",
    marginLeft: 68,
  },
});
