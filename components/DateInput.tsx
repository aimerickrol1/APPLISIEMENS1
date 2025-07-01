import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform, useColorScheme } from 'react-native';

interface DateInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: any;
}

export function DateInput({ label, value, onChangeText, placeholder, error, containerStyle }: DateInputProps) {
  const colorScheme = useColorScheme(); // NOUVEAU : Détecter le thème système
  const isDark = colorScheme === 'dark';

  const formatDateInput = (text: string) => {
    // Supprimer tous les caractères non numériques
    const numbers = text.replace(/\D/g, '');
    
    // Limiter à 8 chiffres maximum (JJMMAAAA)
    const limitedNumbers = numbers.slice(0, 8);
    
    // Ajouter les "/" automatiquement
    let formatted = limitedNumbers;
    if (limitedNumbers.length >= 3) {
      formatted = limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2);
    }
    if (limitedNumbers.length >= 5) {
      formatted = limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2, 4) + '/' + limitedNumbers.slice(4);
    }
    
    return formatted;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatDateInput(text);
    onChangeText(formatted);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isDark && styles.inputDark, // NOUVEAU : Style pour mode sombre
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"} // NOUVEAU : Couleur adaptative
        keyboardType="numeric"
        maxLength={10} // JJ/MM/AAAA = 10 caractères
        returnKeyType="done"
        blurOnSubmit={true}
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