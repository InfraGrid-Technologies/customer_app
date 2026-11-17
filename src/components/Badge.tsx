/**
 * Global Design System: Status Badge Component
 *
 * ROLE:
 * Renders small status pills (e.g. "VERIFIED", "PENDING", "COMPLIANT").
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../core/theme';

const { colors, radius } = theme;

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
  icon,
}) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      {icon}
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  success: {
    backgroundColor: colors.emerald50,
    borderWidth: 1,
    borderColor: colors.emerald200,
  },
  successText: {
    color: colors.emerald700,
  },
  warning: {
    backgroundColor: colors.amber50,
    borderWidth: 1,
    borderColor: colors.amber200,
  },
  warningText: {
    color: colors.amber700,
  },
  danger: {
    backgroundColor: colors.red50,
    borderWidth: 1,
    borderColor: colors.red200,
  },
  dangerText: {
    color: colors.danger,
  },
  info: {
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue200,
  },
  infoText: {
    color: colors.blue700,
  },
  neutral: {
    backgroundColor: colors.slate100,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  neutralText: {
    color: colors.slate700,
  },
});

export default Badge;

