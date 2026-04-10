import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../../core/theme';
import { useAuthStore } from '../../hooks/auth/useAuthStore';
import { Eye, EyeOff, ArrowRight, Camera, User } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { storage } from '../../../infrastructure/storage/mmkv';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
};

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, error, clearError } = useAuthStore();

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7, maxWidth: 400, maxHeight: 400 });
    if (result.assets && result.assets[0]?.uri) setAvatarUri(result.assets[0].uri);
  };

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match'); return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters'); return;
    }
    setIsLoading(true);
    clearError();
    // Save name & avatar
    if (name.trim()) storage.set('user_display_name', name.trim());
    if (avatarUri) storage.set('user_avatar_uri', avatarUri);

    const success = await signUp(email, password);
    setIsLoading(false);
    if (success) {
      Alert.alert('Account Created!', 'Please check your email to verify your account.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      Alert.alert('Signup Failed', error || 'Please try again');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>CREATE ACCOUNT</Text>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Start your journey to financial freedom.</Text>
          </View>

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto} activeOpacity={0.7}>
            {avatarUri
              ? <Image source={{ uri: avatarUri }} style={styles.avatar} />
              : <View style={styles.avatarPlaceholder}><User size={32} color={colors.textMuted} /></View>
            }
            <View style={styles.cameraBtn}><Camera size={14} color={colors.white} /></View>
          </TouchableOpacity>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.inputFlex} placeholder="Min. 6 characters" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPass} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showPass ? <EyeOff size={20} color={colors.textMuted} /> : <Eye size={20} color={colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.inputFlex} placeholder="Repeat password" placeholderTextColor={colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showConfirm ? <EyeOff size={20} color={colors.textMuted} /> : <Eye size={20} color={colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.terms}>By signing up you agree to our Terms of Service and Privacy Policy.</Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.ctaDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.85}>
            <Text style={styles.ctaText}>{isLoading ? 'Creating Account…' : 'Create Account'}</Text>
            {!isLoading && <ArrowRight size={20} color={colors.white} />}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const inputBase = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: borderRadius.md,
  paddingHorizontal: spacing.md,
  color: colors.text,
  fontSize: 16,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: 40 },
  header: { marginBottom: spacing.xl },
  eyebrow: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary },
  avatarContainer: { alignSelf: 'center', marginBottom: spacing.xl, position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  fieldGroup: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  input: { ...inputBase as any, paddingVertical: Platform.OS === 'ios' ? 15 : 12 },
  inputRow: { ...(inputBase as any), flexDirection: 'row', alignItems: 'center', paddingVertical: 0 },
  inputFlex: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: Platform.OS === 'ios' ? 15 : 12 },
  terms: { ...typography.caption, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: spacing.sm },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40, paddingTop: spacing.md,
    backgroundColor: colors.background, gap: spacing.md,
  },
  ctaButton: {
    backgroundColor: colors.primary, height: 56, borderRadius: borderRadius.md,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { ...typography.bodyMedium, color: colors.white, fontWeight: '700', fontSize: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { ...typography.bodySmall, color: colors.textSecondary },
  loginLink: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
});
