import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, typography } from '../../../core/theme';
import { TrendingUp, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useHaptics } from '../../hooks/useHaptics';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const slides = [
  {
    id: '1',
    Icon: TrendingUp,
    title: 'Track Every\nTransaction',
    subtitle: 'Monitor your income and expenses in real-time with smart categorization.',
    accent: '#7C3AED',
  },
  {
    id: '2',
    Icon: ShieldCheck,
    title: 'Stay Within\nYour Budget',
    subtitle: 'Get instant alerts when you hit 80% of your monthly income spend.',
    accent: '#2563EB',
  },
  {
    id: '3',
    Icon: Sparkles,
    title: 'AI-Powered\nMoney Tips',
    subtitle: 'Local AI analyzes your spending and suggests personalized savings strategies.',
    accent: '#059669',
  },
];

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const haptics = useHaptics();

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      haptics.impact();
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      haptics.success();
      navigation.navigate('OnboardingProfile');
    }
  };

  const handleSkip = () => {
    haptics.selection();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => {
          const Icon = item.Icon;
          return (
            <View style={styles.slide}>
              {/* Icon block */}
              <View style={[styles.iconBox, { backgroundColor: item.accent + '1A' }]}>
                <Icon size={56} color={item.accent} strokeWidth={1.5} />
              </View>

              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>
          );
        }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaText}>
            {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => { haptics.selection(); navigation.navigate('Login'); }}>
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={{ color: colors.primary }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  skipText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  slide: {
    width,
    paddingHorizontal: spacing.xl,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    marginTop: -40,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  slideTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 48,
  },
  slideSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 26,
    maxWidth: 300,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  loginLinkText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
