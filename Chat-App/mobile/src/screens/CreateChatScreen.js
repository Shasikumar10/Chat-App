import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { createChat } from '../services/api';

export default function CreateChatScreen({ navigation }) {
  const [chatName, setChatName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateChat = async () => {
    if (!participantEmail.trim()) {
      Alert.alert('Error', 'Please enter participant email');
      return;
    }

    setLoading(true);
    try {
      const chatData = {
        type: isGroupChat ? 'group' : 'direct',
        participants: [participantEmail],
      };

      if (isGroupChat && chatName.trim()) {
        chatData.name = chatName;
      }

      const { data } = await createChat(chatData);
      Alert.alert('Success', 'Chat created successfully!');
      navigation.navigate('Chat', { 
        chatId: data.chat._id, 
        chatName: data.chat.name || participantEmail 
      });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Chat</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Group Chat</Text>
          <Switch
            value={isGroupChat}
            onValueChange={setIsGroupChat}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isGroupChat ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        {isGroupChat && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={chatName}
              onChangeText={setChatName}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Participant Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={participantEmail}
            onChangeText={setParticipantEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            {isGroupChat 
              ? 'You can add more participants later' 
              : 'Create a direct chat with this user'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateChat}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Chat'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
