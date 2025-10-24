/**
 * SettingsScreen
 * 
 * User settings including accessibility, theme, and preferences
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {Card} from '../components/Card/Card';
import {Button} from '../components/Button';
import {useAuthStore} from '../stores/authStore';

export const SettingsScreen = ({navigation}: any) => {
  const {user, logout} = useAuthStore();
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            console.log('Delete account');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Section */}
      <Card variant="elevated">
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileRole}>
              Grade: {user?.grade_level || 'Not set'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Accessibility Settings */}
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Accessibility</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Text Size</Text>
            <Text style={styles.settingDescription}>
              Adjust text size for better readability
            </Text>
          </View>
          <View style={styles.segmentedControl}>
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <Button
                key={size}
                variant={textSize === size ? 'primary' : 'outline'}
                size="sm"
                onPress={() => setTextSize(size)}
              >
                {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
              </Button>
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Text-to-Speech</Text>
            <Text style={styles.settingDescription}>
              Read lessons aloud automatically
            </Text>
          </View>
          <Switch
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
            trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
            thumbColor={ttsEnabled ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Voice Input</Text>
            <Text style={styles.settingDescription}>
              Use voice to answer questions
            </Text>
          </View>
          <Switch
            value={voiceInputEnabled}
            onValueChange={setVoiceInputEnabled}
            trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
            thumbColor={voiceInputEnabled ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Text style={styles.settingDescription}>
              Vibrate on button press
            </Text>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
            thumbColor={hapticFeedback ? '#3B82F6' : '#F3F4F6'}
          />
        </View>
      </Card>

      {/* Download Settings */}
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Downloads</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>WiFi Only</Text>
            <Text style={styles.settingDescription}>
              Download lessons only on WiFi
            </Text>
          </View>
          <Switch
            value={wifiOnlyDownload}
            onValueChange={setWifiOnlyDownload}
            trackColor={{false: '#D1D5DB', true: '#93C5FD'}}
            thumbColor={wifiOnlyDownload ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <Button
          variant="outline"
          size="md"
          onPress={() => console.log('Clear cache')}
          fullWidth
        >
          🗑️ Clear Downloaded Lessons
        </Button>
      </Card>

      {/* Account Actions */}
      <Card variant="elevated">
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.actionButtons}>
          <Button
            variant="outline"
            size="md"
            onPress={handleLogout}
            fullWidth
          >
            Logout
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onPress={handleDeleteAccount}
            fullWidth
          >
            Delete Account
          </Button>
        </View>
      </Card>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Aivo Learning v1.0.0</Text>
        <Text style={styles.appInfoText}>© 2025 Aivo Learning</Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtons: {
    gap: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 32,
  },
});

export default SettingsScreen;
