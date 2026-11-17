/**
 * Global Design System: Button Component
 *
 * ROLE:
 * Reusable, accessible button supporting primary, secondary, danger, and outline variants.
 * Handles disabled states and loading spinners automatically.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../core/theme';

const { colors, radius } = theme;

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  ...rest
}) => {
  const isActionDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isActionDisabled && styles.disabled,
        style,
      ]}
      disabled={isActionDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? colors.primary : colors.white}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              styles[`${variant}Text` as keyof typeof styles],
              isActionDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    gap: 8,
  },
  baseText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
  },
  secondary: {
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue200,
  },
  secondaryText: {
    color: colors.blue700,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.slate300,
  },
  outlineText: {
    color: colors.slate700,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  dangerText: {
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.slate400,
  },
});

export default Button;
