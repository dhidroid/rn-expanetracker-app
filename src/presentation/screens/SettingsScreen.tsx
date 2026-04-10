import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../core/theme';
import {
  User,
  LogOut,
  ChevronRight,
  RefreshCw,
  Bell,
  Sparkles,
  Shield,
  Info,
  Database,
} from 'lucide-react-native';
import { useAuthStore } from '../hooks/auth/useAuthStore';
import { storage } from '../../infrastructure/storage/mmkv';
import { SyncService } from '../../infrastructure/supabase/syncService';
import { NotificationService } from '../../infrastructure/notifications/notificationService';

const APP_VERSION = '2.0.0';

export const SettingsScreen: React.FC = () => {
  const { user, signOut, isAuthenticated } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [storageUsed, setStorageUsed] = useState('0 KB');

  const displayName = storage.getString('user_display_name') || 'User';
  const avatarUri = storage.getString('user_avatar_uri');

  useEffect(() => {
    // Calculate storage usage
    const keys = storage.getAllKeys();
    let bytes = 0;
    keys.forEach(k => { const v = storage.getString(k); if (v) bytes += v.length * 2; });
    setStorageUsed(`${(bytes / 1024).toFixed(1)} KB`);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await SyncService.syncExpenses();
    setIsSyncing(false);
    if (result.success) Alert.alert('Synced', 'Your data has been synced.');
    else Alert.alert('Sync Failed', result.error || 'Unable to sync');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure? Your local data will be preserved.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    if (val) {
      await NotificationService.requestPermission();
      await NotificationService.scheduleMonthlyReminder();
    }
  };

  const SettingRow = ({ icon: Icon, label, value, onPress, showChevron = true }: any) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Icon size={18} color={colors.primary} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        {showChevron && onPress && <ChevronRight size={16} color={colors.textMuted} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Profile</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {avatarUri
            ? <Image source={{ uri: avatarUri }} style={styles.avatar} />
            : (
              <View style={styles.avatarPlaceholder}>
                <User size={36} color={colors.primary} />
              </View>
            )
          }
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{isAuthenticated && user ? user.email : 'Guest'}</Text>
            <View style={[styles.badge, { backgroundColor: isAuthenticated ? colors.income + '18' : colors.textMuted + '18' }]}>
              <Text style={[styles.badgeText, { color: isAuthenticated ? colors.income : colors.textMuted }]}>
                {isAuthenticated ? '● Syncing' : '○ Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell size={18} color={colors.primary} />
                <Text style={styles.settingLabel}>Budget Alerts</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <View style={styles.settingsCard}>
            <SettingRow icon={Database} label="Storage Used" value={storageUsed} showChevron={false} />
            {isAuthenticated && (
              <>
                <View style={styles.rowDivider} />
                <SettingRow
                  icon={RefreshCw}
                  label={isSyncing ? 'Syncing…' : 'Sync Now'}
                  onPress={handleSync}
                />
              </>
            )}
          </View>
        </View>

        {/* AI */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI SETTINGS</Text>
          <View style={styles.settingsCard}>
            <SettingRow icon={Sparkles} label="Ollama Endpoint" value="localhost:11434" showChevron={false} />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.settingsCard}>
            <SettingRow icon={Info} label="Version" value={APP_VERSION} showChevron={false} />
            <View style={styles.rowDivider} />
            <SettingRow icon={Shield} label="Privacy Policy" onPress={() => {}} />
          </View>
        </View>

        {/* Sign Out */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut} activeOpacity={0.7}>
            <LogOut size={18} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  screenTitle: { ...typography.h2, color: colors.text, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 120 },

  // Profile
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1 },
  profileName: { ...typography.h4, color: colors.text, marginBottom: 2 },
  profileEmail: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm },
  badgeText: { ...typography.caption, fontWeight: '600' },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  settingsCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },

  // Rows
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  settingLabel: { ...typography.bodyMedium, color: colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  settingValue: { ...typography.bodySmall, color: colors.textMuted },
  rowDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },

  // Sign out
  signOutRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg, marginBottom: spacing.xl },
  signOutText: { ...typography.bodyMedium, color: colors.error, fontWeight: '600' },
});
