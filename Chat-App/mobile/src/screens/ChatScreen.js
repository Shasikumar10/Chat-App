import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { getMessages, sendMessage, markRead } from '../services/api';
import socketService from '../services/socket';
import api from '../services/api';

export default function ChatScreen({ route, navigation }) {
  const { chatId, chatName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    navigation.setOptions({ title: chatName });
    loadMessages();
    socketService.joinChat(chatId, user.id);

    // Listen for new messages
    socketService.on('message:new', (message) => {
      if (message.chat === chatId) {
        setMessages((prev) => [...prev, message]);
        if (message.sender !== user.id) {
          markRead(message._id);
        }
      }
    });

    return () => {
      socketService.leaveChat(chatId, user.id);
      socketService.off('message:new');
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const { data } = await getMessages(chatId);
      setMessages(data.messages);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (attachments = []) => {
    if (!inputText.trim() && attachments.length === 0) return;

    const tempMessage = {
      _id: Date.now().toString(),
      content: inputText,
      attachments,
      sender: { _id: user.id, displayName: user.displayName },
      createdAt: new Date().toISOString(),
      temp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText('');

    try {
      await sendMessage({
        chat: chatId,
        content: inputText,
        attachments,
      });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadMedia(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        await uploadMedia(result);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadMedia = async (asset) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType || asset.type || 'application/octet-stream',
        name: asset.fileName || asset.name || 'file',
      });

      const response = await api.post('/uploads/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.file) {
        await handleSend([response.data.file]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender._id === user.id || item.sender === user.id;

    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && (
          <Text style={styles.senderName}>{item.sender.displayName || 'Unknown'}</Text>
        )}
        {item.attachments && item.attachments.length > 0 && (
          <View style={styles.attachments}>
            {item.attachments.map((attachment, index) => (
              <View key={index} style={styles.attachment}>
                {attachment.type?.startsWith('image/') ? (
                  <Image
                    source={{ uri: attachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.attachmentFile}>
                    <Text style={styles.attachmentFileName} numberOfLines={1}>
                      {attachment.filename}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
        {item.content ? <Text style={styles.messageText}>{item.content}</Text> : null}
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          )
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={pickImage}
          disabled={uploading}
          accessibilityLabel="Attach photo or video"
          accessibilityRole="button"
        >
          <Text style={styles.attachButtonText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={pickDocument}
          disabled={uploading}
          accessibilityLabel="Attach document"
          accessibilityRole="button"
        >
          <Text style={styles.attachButtonText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!uploading}
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSend()}
          disabled={uploading}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  attachments: {
    marginBottom: 8,
  },
  attachment: {
    marginBottom: 4,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  attachmentFile: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 10,
    borderRadius: 8,
  },
  attachmentFileName: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  attachButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButtonText: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
});
