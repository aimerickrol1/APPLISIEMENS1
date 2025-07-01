import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface NumericInputProps {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  style?: any;
}

export function NumericInput({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  style
}: NumericInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = Math.min(value + step, max);
    onValueChange(newValue);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Math.max(value - step, min);
    onValueChange(newValue);
  };

  const handleTextChange = (text: string) => {
    // Permettre seulement les chiffres
    const numericText = text.replace(/[^0-9]/g, '');
    setInputValue(numericText);
    
    if (numericText === '') {
      onValueChange(min);
      return;
    }
    
    const numericValue = parseInt(numericText, 10);
    if (!isNaN(numericValue)) {
      const clampedValue = Math.max(min, Math.min(max, numericValue));
      onValueChange(clampedValue);
    }
  };

  const handleBlur = () => {
    // S'assurer que la valeur affichée correspond à la valeur réelle
    setInputValue(value.toString());
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={disabled || value <= min}
        >
          <Minus size={16} color={disabled || value <= min ? '#9CA3AF' : '#009999'} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={inputValue}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          keyboardType="numeric"
          textAlign="center"
          editable={!disabled}
          selectTextOnFocus={true}
          maxLength={3}
        />
        
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={disabled || value >= max}
        >
          <Plus size={16} color={disabled || value >= max ? '#9CA3AF' : '#009999'} />
        </TouchableOpacity>
      </View>
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
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
  },
  button: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
});