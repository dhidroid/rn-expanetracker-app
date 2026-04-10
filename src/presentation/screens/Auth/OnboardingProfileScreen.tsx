import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography, borderRadius } from '../../../core/theme';
import { Camera, User, ChevronDown, ArrowRight } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { storage } from '../../../infrastructure/storage/mmkv';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'OnboardingProfile'>;

const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'JPY (¥)', 'AUD (A$)'];

export const OnboardingProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD ($)');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [nameError, setNameError] = useState('');

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 400,
      maxHeight: 400,
    });
    if (result.assets && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (!name.trim()) {
      setNameError('Please enter your name');
      return;
    }
    // Save profile to MMKV
    storage.set('user_display_name', name.trim());
    storage.set('user_currency', selectedCurrency);
    if (avatarUri) storage.set('user_avatar_uri', avatarUri);

    navigation.navigate('Income');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>Personalize your experience</Text>
        </View>

        {/* Avatar Picker */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto} activeOpacity={0.7}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={40} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.cameraButton}>
            <Camera size={16} color={colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to add profile photo</Text>

        {/* Name Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>YOUR NAME</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="John Doe"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={t => { setName(t); setNameError(''); }}
            autoCapitalize="words"
            returnKeyType="done"
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        {/* Currency Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>DEFAULT CURRENCY</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            activeOpacity={0.7}
          >
            <Text style={styles.pickerText}>{selectedCurrency}</Text>
            <ChevronDown size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {showCurrencyPicker && (
            <View style={styles.dropdownList}>
              {CURRENCIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.dropdownItem, c === selectedCurrency && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedCurrency(c);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={[styles.dropdownText, c === selectedCurrency && styles.dropdownTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Continue</Text>
          <ArrowRight size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: 120 },
  header: { marginBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary },

  // Avatar
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  avatar: { width: 100, height: 100, borderRadius: borderRadius.full },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },

  // Fields
  fieldGroup: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    color: colors.text,
    fontSize: 16,
  },
  inputError: { borderColor: colors.error },
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs },

  // Currency picker
  picker: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: { ...typography.body, color: colors.text },
  dropdownList: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  dropdownItemActive: { backgroundColor: colors.primary + '22' },
  dropdownText: { ...typography.body, color: colors.textSecondary },
  dropdownTextActive: { color: colors.primary, fontWeight: '600' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctaText: { ...typography.bodyMedium, color: colors.white, fontWeight: '700', fontSize: 16 },
});
