/**
 * Global Design System: Card Component
 *
 * ROLE:
 * Standard elevated container surface for grouping related content and inputs.
 */

import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { theme } from '../core/theme';

const { colors, radius, shadows } = theme;

export interface CardProps extends ViewProps {
  style?: ViewStyle;
  variant?: 'flat' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'flat',
  ...rest
}) => {
  return (
    <View style={[styles.card, styles[variant], style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginVertical: 6,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  elevated: {
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.blue200,
    backgroundColor: colors.blue50,
  },
});

export default Card;

