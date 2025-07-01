import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, Platform, useColorScheme } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  clearZeroOnFocus?: boolean; // NOUVEAU : Option pour effacer le 0 au focus
}

export function Input({ label, error, containerStyle, style, clearZeroOnFocus = false, ...props }: InputProps) {
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const colorScheme = useColorScheme(); // NOUVEAU : Détecter le thème système
  const isDark = colorScheme === 'dark';

  const handleFocus = (e: any) => {
    // NOUVEAU : Si c'est la première fois qu'on focus et que la valeur est "0", on la vide
    if (clearZeroOnFocus && !hasBeenFocused && props.value === '0') {
      props.onChangeText?.('');
    }
    setHasBeenFocused(true);
    props.onFocus?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isDark && styles.inputDark, // NOUVEAU : Style pour mode sombre
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"} // NOUVEAU : Couleur adaptative
        returnKeyType="done"
        blurOnSubmit={true}
        {...props}
        onFocus={handleFocus}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 6,
  },
  // NOUVEAU : Style pour le label en mode sombre
  labelDark: {
    color: '#D1D5DB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
    color: '#111827', // NOUVEAU : Couleur de texte explicite
    minHeight: Platform.OS === 'ios' ? 48 : 44,
  },
  // NOUVEAU : Style pour l'input en mode sombre
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#F9FAFB', // Texte blanc en mode sombre
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
});