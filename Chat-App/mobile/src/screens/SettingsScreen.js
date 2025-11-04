import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const { user, setUser, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState(user?.settings?.notifications ?? true);
  const [fontSize, setFontSize] = useState(user?.settings?.fontSize || 'medium');
  const [loading, setLoading] = useState(false);

  const fontSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ];

  const handleNotificationToggle = async (value) => {
    setNotifications(value);
    await saveSettings({ notifications: value, fontSize });
  };

  const handleFontSizeChange = async (value) => {
    setFontSize(value);
    await saveSettings({ notifications, fontSize: value });
  };

  const saveSettings = async (settings) => {
    try {
      const response = await api.patch('/profile', { settings });
      if (response.data?.user) {
        setUser(response.data.user);
        await AsyncStorage.setItem('fontSize', settings.fontSize);
      }
    } catch (error) {
      console.error('Settings save error:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete account API
            Alert.alert('Info', 'Account deletion feature coming soon');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications for new messages
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationToggle}
            accessibilityLabel="Toggle push notifications"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        
        <View style={styles.settingColumn}>
          <Text style={styles.settingLabel}>Font Size</Text>
          <Text style={styles.settingDescription}>
            Choose a comfortable reading size
          </Text>
          <View style={styles.fontSizeOptions}>
            {fontSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.fontSizeButton,
                  fontSize === option.value && styles.fontSizeButtonActive
                ]}
                onPress={() => handleFontSizeChange(option.value)}
                accessibilityLabel={`Set font size to ${option.label}`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.fontSizeButtonText,
                    fontSize === option.value && styles.fontSizeButtonTextActive
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>{Platform.OS}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityLabel="Logout"
          accessibilityRole="button"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          accessibilityLabel="Delete account"
          accessibilityRole="button"
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
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
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingColumn: {
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  fontSizeOptions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  fontSizeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  fontSizeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  fontSizeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  fontSizeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
