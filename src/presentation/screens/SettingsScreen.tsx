import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Header } from '../components';
import { spacing, typography, borderRadius } from '../../core/theme';
import { useTheme, useIsDarkMode, useToggleTheme } from '../hooks/useTheme';

const APP_VERSION = '1.0.0';

export const SettingsScreen: React.FC = () => {
  const colors = useTheme();
  const isDarkMode = useIsDarkMode();
  const toggleTheme = useToggleTheme();

  return (
    <React.Fragment>
      <Header title="Settings" />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <View
            style={[
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: colors.text }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          <View
            style={[
              styles.info,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.text }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
              {APP_VERSION}
            </Text>
          </View>
          <View
            style={[
              styles.info,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.text }]}>
              Storage
            </Text>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
              MMKV
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            License
          </Text>
          <View
            style={[
              styles.licenseContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.licenseTitle, { color: colors.text }]}>
              MIT License
            </Text>
            <Text style={[styles.licenseText, { color: colors.textSecondary }]}>
              Copyright (c) 2024 ExpanceTracker
            </Text>
            <Text
              style={[
                styles.licenseText,
                { color: colors.textMuted, marginTop: spacing.sm },
              ]}
            >
              Permission is hereby granted, free of charge, to any person
              obtaining a copy of this software and associated documentation
              files (the "Software"), to deal in the Software without
              restriction.
            </Text>
          </View>
        </View>
      </ScrollView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  label: {
    ...typography.body,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
  },
  infoValue: {
    ...typography.body,
  },
  licenseContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  licenseTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  licenseText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
});
