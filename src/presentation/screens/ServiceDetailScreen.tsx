import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../core/theme';
import { ArrowLeft } from 'lucide-react-native';

export const ServiceDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const [repeat, setRepeat] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('Standart');

  const plans = [
    { id: 'Basic', price: '4,99' },
    { id: 'Standart', price: '7,49' },
    { id: 'Premium', price: '9,99' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Netflix</Text>
        <TouchableOpacity>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Text style={styles.netflixLogoText}>N</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarFace}>:-)</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>James_Adams</Text>
            <Text style={styles.profilePlan}>Business Plus</Text>
          </View>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, isSelected && styles.planCardActive]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <Text style={[styles.planTitle, isSelected && styles.planTitleActive]}>
                  {plan.id}
                </Text>
                <Text style={[styles.planPrice, isSelected && styles.planPriceActive]}>
                  {plan.price} <Text style={[styles.planPriceSuffix, isSelected && styles.planPriceActive]}>$/m</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Billing Section */}
        <Text style={styles.sectionTitle}>Billing</Text>

        <View style={styles.billingCard}>
          <View style={styles.billingRow}>
            <View>
              <Text style={styles.billingLabel}>First payment</Text>
              <Text style={styles.billingSubLabel}>Set another date</Text>
            </View>
            <Text style={styles.billingValue}>Today</Text>
          </View>
        </View>

        <View style={styles.billingCard}>
          <View style={[styles.billingRow, { paddingBottom: spacing.lg }]}>
            <View>
              <Text style={styles.billingLabel}>Repeat</Text>
              <Text style={styles.billingSubLabel}>Set a cycle for your plan</Text>
            </View>
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.border}
              onValueChange={setRepeat}
              value={repeat}
            />
          </View>
          <View style={styles.cycleButtons}>
            <TouchableOpacity style={styles.cycleButton}>
              <Text style={styles.cycleButtonText}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cycleButton, styles.cycleButtonActive]}>
              <Text style={styles.cycleButtonTextActive}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cycleButton}>
              <Text style={styles.cycleButtonText}>Year</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.billingCard}>
          <View style={styles.billingRow}>
            <View>
              <Text style={styles.billingLabel}>Payment method</Text>
              <Text style={styles.billingSubLabel}>Select another method</Text>
            </View>
            <Text style={styles.billingValue}>Paypal</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
  },
  saveText: {
    ...typography.body,
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  netflixLogoText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#E50914',
    letterSpacing: -5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarFace: {
    fontSize: 20,
    color: colors.text,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  profilePlan: {
    ...typography.caption,
    color: colors.textMuted,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  planCardActive: {
    backgroundColor: colors.white,
  },
  planTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 8,
  },
  planTitleActive: {
    color: colors.text,
  },
  planPrice: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  planPriceActive: {
    color: colors.text,
  },
  planPriceSuffix: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  billingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  billingSubLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  billingValue: {
    ...typography.body,
    color: colors.white,
  },
  cycleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background, // darker inset
    borderRadius: borderRadius.full,
    padding: 4,
  },
  cycleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  cycleButtonActive: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cycleButtonText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cycleButtonTextActive: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
