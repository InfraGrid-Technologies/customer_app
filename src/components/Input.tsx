/**
 * Global Design System: Input Component
 *
 * ROLE:
 * Standardized text input with label, error message, and monospace support for codes/IDs.
 */

import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { theme } from '../core/theme';

const { colors, radius } = theme;

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  isMonospace?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  isMonospace = false,
  containerStyle,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isMonospace && styles.monospace,
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={colors.slate400}
        {...rest}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate700,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate900,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.red50,
  },
  monospace: {
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    color: colors.slate500,
    marginTop: 3,
  },
});

export default Input;

