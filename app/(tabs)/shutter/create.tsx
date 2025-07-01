import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ShutterType } from '@/types';
import { storage } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateShutterScreen() {
  const { strings, currentLanguage } = useLanguage();
  const { zoneId } = useLocalSearchParams<{ zoneId: string }>();
  const [name, setName] = useState('');
  const [type, setType] = useState<ShutterType>('high');
  const [referenceFlow, setReferenceFlow] = useState('0');
  const [measuredFlow, setMeasuredFlow] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; referenceFlow?: string; measuredFlow?: string }>({});

  // NOUVEAU : Détecter le thème système
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // FONCTION POUR OBTENIR LE PRÉFIXE SELON LA LANGUE ET LE TYPE
  const getShutterPrefix = (shutterType: ShutterType, language: string) => {
    const prefixes = {
      fr: { high: 'VH', low: 'VB' },      // Français : Volet Haut / Volet Bas
      en: { high: 'HS', low: 'LS' },      // Anglais : High Shutter / Low Shutter
      es: { high: 'CA', low: 'CB' },      // Espagnol : Compuerta Alta / Compuerta Baja
      it: { high: 'SA', low: 'SB' },      // Italien : Serranda Alta / Serranda Bassa
    };
    
    return prefixes[language as keyof typeof prefixes]?.[shutterType] || prefixes.fr[shutterType];
  };

  // INITIALISER LE NOM AU PREMIER RENDU AVEC LE BON PRÉFIXE
  useEffect(() => {
    const prefix = getShutterPrefix('high', currentLanguage);
    setName(prefix);
  }, []); // Seulement au premier rendu

  // METTRE À JOUR LE PRÉFIXE QUAND LA LANGUE CHANGE
  useEffect(() => {
    const newPrefix = getShutterPrefix(type, currentLanguage);
    // Seulement si le nom actuel est un préfixe simple (2-3 caractères)
    if (name.length <= 3) {
      setName(newPrefix);
    }
  }, [currentLanguage]);

  // METTRE À JOUR LE PRÉFIXE QUAND LE TYPE CHANGE
  useEffect(() => {
    const newPrefix = getShutterPrefix(type, currentLanguage);
    const oldPrefix = getShutterPrefix(type === 'high' ? 'low' : 'high', currentLanguage);
    
    // Si le nom commence par l'ancien préfixe, le remplacer
    if (name.startsWith(oldPrefix)) {
      setName(name.replace(oldPrefix, newPrefix));
    } else if (name.length <= 3) {
      // Si c'est un nom court (probablement juste un préfixe), le remplacer
      setName(newPrefix);
    }
  }, [type]);

  const handleBack = () => {
    if (zoneId) {
      // CORRIGÉ : Retourner vers la zone (liste des volets)
      router.push(`/(tabs)/zone/${zoneId}`);
    } else {
      router.push('/(tabs)/');
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; referenceFlow?: string; measuredFlow?: string } = {};

    if (!name.trim()) {
      newErrors.name = strings.nameRequired;
    }

    const refFlow = parseFloat(referenceFlow);
    if (!referenceFlow || isNaN(refFlow) || refFlow < 0) {
      newErrors.referenceFlow = strings.positiveOrZeroRequired;
    }

    const measFlow = parseFloat(measuredFlow);
    if (!measuredFlow || isNaN(measFlow) || measFlow < 0) {
      newErrors.measuredFlow = strings.positiveOrZeroRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm() || !zoneId) return;

    setLoading(true);
    try {
      const shutter = await storage.createShutter(zoneId, {
        name: name.trim(),
        type,
        referenceFlow: parseFloat(referenceFlow),
        measuredFlow: parseFloat(measuredFlow),
        remarks: remarks.trim() || undefined,
      });

      if (shutter) {
        // CORRIGÉ : Naviguer vers le volet créé
        router.push(`/(tabs)/shutter/${shutter.id}`);
      } else {
        Alert.alert(strings.error, 'Impossible de créer le volet. Zone introuvable.');
      }
    } catch (error) {
      Alert.alert(strings.error, 'Impossible de créer le volet. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: ShutterType) => {
    setType(newType);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={strings.newShutter}
        onBack={handleBack}
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={`${strings.shutterName} *`}
          value={name}
          onChangeText={setName}
          placeholder={`Ex: ${getShutterPrefix('low', currentLanguage)}01, ${getShutterPrefix('high', currentLanguage)}01`}
          error={errors.name}
        />

        <View style={styles.typeContainer}>
          <Text style={[styles.typeLabel, isDark && styles.typeLabelDark]}>{strings.shutterType} *</Text>
          <View style={styles.typeOptions}>
            <TouchableOpacity
              style={[styles.typeOption, type === 'high' && styles.typeOptionSelected]}
              onPress={() => handleTypeChange('high')}
            >
              <Text style={[styles.typeOptionText, type === 'high' && styles.typeOptionTextSelected]}>
                {strings.shutterHigh}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeOption, type === 'low' && styles.typeOptionSelected]}
              onPress={() => handleTypeChange('low')}
            >
              <Text style={[styles.typeOptionText, type === 'low' && styles.typeOptionTextSelected]}>
                {strings.shutterLow}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Input
          label={`${strings.referenceFlow} (${strings.cubicMeterPerHour}) *`}
          value={referenceFlow}
          onChangeText={setReferenceFlow}
          placeholder="Ex: 5000"
          keyboardType="numeric"
          error={errors.referenceFlow}
          clearZeroOnFocus={true}
        />

        <Input
          label={`${strings.measuredFlow} (${strings.cubicMeterPerHour}) *`}
          value={measuredFlow}
          onChangeText={setMeasuredFlow}
          placeholder="Ex: 4800"
          keyboardType="numeric"
          error={errors.measuredFlow}
          clearZeroOnFocus={true}
        />

        <Input
          label={`${strings.remarks} (${strings.optional})`}
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Observations, conditions de mesure..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={strings.createShutter}
            onPress={handleCreate}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 6,
  },
  // NOUVEAU : Style pour le label en mode sombre
  typeLabelDark: {
    color: '#D1D5DB',
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  typeOptionSelected: {
    borderColor: '#009999',
    backgroundColor: '#F0FDFA',
  },
  typeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  typeOptionTextSelected: {
    color: '#009999',
  },
  buttonContainer: {
    marginTop: 24,
  },
});