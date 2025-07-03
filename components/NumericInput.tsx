import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface NumericInputProps {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  style?: any;
}

export function NumericInput({
  label,
  value,
  onValueChange,
  min = 0,
  max = 50,
  disabled = false,
  style
}: NumericInputProps) {
  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onValueChange(value + 1);
  };

  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onValueChange(value - 1);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (disabled || value <= min) && styles.buttonDisabled
          ]}
          onPress={handleDecrement}
          disabled={disabled || value <= min}
        >
          <Minus size={16} color={(disabled || value <= min) ? '#9CA3AF' : '#009999'} />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            (disabled || value >= max) && styles.buttonDisabled
          ]}
          onPress={handleIncrement}
          disabled={disabled || value >= max}
        >
          <Plus size={16} color={(disabled || value >= max) ? '#9CA3AF' : '#009999'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  button: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  buttonDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.5,
  },
  valueContainer: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
});