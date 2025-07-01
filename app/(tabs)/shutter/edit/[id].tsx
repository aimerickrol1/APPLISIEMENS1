import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ComplianceIndicator } from '@/components/ComplianceIndicator';
import { Project, Building, FunctionalZone, Shutter, ShutterType } from '@/types';
import { storage } from '@/utils/storage';
import { calculateCompliance, formatDeviation } from '@/utils/compliance';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EditShutterScreen() {
  const { strings, currentLanguage } = useLanguage();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>(); // NOUVEAU : Paramètre 'from'
  const [shutter, setShutter] = useState<Shutter | null>(null);
  const [zone, setZone] = useState<FunctionalZone | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<ShutterType>('high');
  const [referenceFlow, setReferenceFlow] = useState('');
  const [measuredFlow, setMeasuredFlow] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; referenceFlow?: string; measuredFlow?: string }>({});

  // NOUVEAU : Détecter le thème système
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // NOUVEAU : Fonction pour obtenir le préfixe selon la langue et le type
  const getShutterPrefix = (shutterType: ShutterType, language: string) => {
    const prefixes = {
      fr: { high: 'VH', low: 'VB' },      // Français : Volet Haut / Volet Bas
      en: { high: 'HS', low: 'LS' },      // Anglais : High Shutter / Low Shutter
      es: { high: 'CA', low: 'CB' },      // Espagnol : Compuerta Alta / Compuerta Baja
      it: { high: 'SA', low: 'SB' },      // Italien : Serranda Alta / Serranda Bassa
    };
    
    return prefixes[language as keyof typeof prefixes]?.[shutterType] || prefixes.fr[shutterType];
  };

  useEffect(() => {
    loadShutter();
  }, [id]);

  const loadShutter = async () => {
    try {
      const projects = await storage.getProjects();
      for (const proj of projects) {
        for (const bldg of proj.buildings) {
          for (const z of bldg.functionalZones) {
            const foundShutter = z.shutters.find(s => s.id === id);
            if (foundShutter) {
              setShutter(foundShutter);
              setZone(z);
              setBuilding(bldg);
              setProject(proj);
              
              // Pré-remplir les champs
              setName(foundShutter.name);
              setType(foundShutter.type);
              setReferenceFlow(foundShutter.referenceFlow.toString());
              setMeasuredFlow(foundShutter.measuredFlow.toString());
              setRemarks(foundShutter.remarks || '');
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du volet:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // CORRIGÉ : Navigation intelligente selon la provenance
  const handleBack = () => {
    try {
      if (from === 'search') {
        // Si on vient de la recherche, retourner à la recherche
        router.push('/(tabs)/search');
      } else if (zone) {
        // Sinon, retourner vers la zone (d'où on vient)
        router.push(`/(tabs)/zone/${zone.id}`);
      } else {
        router.push('/(tabs)/');
      }
    } catch (error) {
      console.error('Erreur de navigation:', error);
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

  const handleSave = async () => {
    if (!validateForm() || !shutter) return;

    setLoading(true);
    try {
      const updatedShutter = await storage.updateShutter(shutter.id, {
        name: name.trim(),
        type,
        referenceFlow: parseFloat(referenceFlow),
        measuredFlow: parseFloat(measuredFlow),
        remarks: remarks.trim() || undefined,
      });

      if (updatedShutter) {
        // CORRIGÉ : Navigation intelligente selon la provenance
        if (from === 'search') {
          // Si on vient de la recherche, retourner à la recherche
          router.push('/(tabs)/search');
        } else if (zone) {
          // Sinon, retourner vers la zone (d'où on vient)
          router.push(`/(tabs)/zone/${zone.id}`);
        } else {
          router.push('/(tabs)/');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification du volet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: ShutterType) => {
    setType(newType);
    // NOUVEAU : Mettre à jour le préfixe selon la langue et le type
    const newPrefix = getShutterPrefix(newType, currentLanguage);
    const oldPrefix = getShutterPrefix(newType === 'high' ? 'low' : 'high', currentLanguage);
    
    // Remplacer l'ancien préfixe par le nouveau, ou utiliser le nouveau préfixe si pas de correspondance
    if (name.startsWith(oldPrefix)) {
      setName(name.replace(oldPrefix, newPrefix));
    } else {
      // Si le nom ne commence pas par un préfixe connu, on garde le nom existant
      // mais on peut suggérer le nouveau préfixe dans le placeholder
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <Header title={strings.loading} onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{strings.loadingData}</Text>
        </View>
      </View>
    );
  }

  if (!shutter || !zone || !building || !project) {
    return (
      <View style={styles.container}>
        <Header title={strings.itemNotFound} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{strings.dataNotFound}</Text>
        </View>
      </View>
    );
  }

  // Calculer la conformité avec les valeurs actuelles
  const currentCompliance = calculateCompliance(parseFloat(referenceFlow) || 0, parseFloat(measuredFlow) || 0);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={strings.editShutter}
        subtitle={`${zone.name} • ${building.name} • ${project.name}`}
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
          clearZeroOnFocus={referenceFlow === '0'}
        />

        <Input
          label={`${strings.measuredFlow} (${strings.cubicMeterPerHour}) *`}
          value={measuredFlow}
          onChangeText={setMeasuredFlow}
          placeholder="Ex: 4800"
          keyboardType="numeric"
          error={errors.measuredFlow}
          clearZeroOnFocus={measuredFlow === '0'}
        />

        <Input
          label={`${strings.remarks} (${strings.optional})`}
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Observations, conditions de mesure..."
          multiline
          numberOfLines={3}
        />

        {/* Aperçu de la conformité en temps réel */}
        {referenceFlow && measuredFlow && !isNaN(parseFloat(referenceFlow)) && !isNaN(parseFloat(measuredFlow)) && (
          <View style={styles.previewCard}>
            <Text style={[styles.previewTitle, isDark && styles.previewTitleDark]}>{strings.compliancePreview}</Text>
            
            <View style={styles.previewFlow}>
              <View style={styles.previewFlowItem}>
                <Text style={[styles.previewFlowLabel, isDark && styles.previewFlowLabelDark]}>{strings.calculatedDeviation}</Text>
                <Text style={[styles.previewFlowValue, { color: currentCompliance.color }]}>
                  {formatDeviation(currentCompliance.deviation)}
                </Text>
              </View>
            </View>

            <View style={styles.previewCompliance}>
              <ComplianceIndicator compliance={currentCompliance} size="medium" />
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={strings.saveChanges}
            onPress={handleSave}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
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
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  // NOUVEAU : Style pour le titre en mode sombre
  previewTitleDark: {
    color: '#F9FAFB',
  },
  previewFlow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  previewFlowItem: {
    alignItems: 'center',
  },
  previewFlowLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  // NOUVEAU : Style pour le label en mode sombre
  previewFlowLabelDark: {
    color: '#9CA3AF',
  },
  previewFlowValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  previewCompliance: {
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
});