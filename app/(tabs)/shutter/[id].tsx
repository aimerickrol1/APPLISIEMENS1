import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Settings, Trash2 } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { ComplianceIndicator } from '@/components/ComplianceIndicator';
import { Project, Building, FunctionalZone, Shutter } from '@/types';
import { storage } from '@/utils/storage';
import { calculateCompliance, formatDeviation } from '@/utils/compliance';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ShutterDetailScreen() {
  const { strings } = useLanguage();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>(); // NOUVEAU : Paramètre 'from'
  const [shutter, setShutter] = useState<Shutter | null>(null);
  const [zone, setZone] = useState<FunctionalZone | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // NOUVEAU : États pour l'édition directe des débits
  const [editingFlows, setEditingFlows] = useState<{
    referenceFlow: string;
    measuredFlow: string;
    hasBeenFocused: { referenceFlow: boolean; measuredFlow: boolean };
  }>({
    referenceFlow: '0',
    measuredFlow: '0',
    hasBeenFocused: { referenceFlow: false, measuredFlow: false }
  });

  // CORRIGÉ : Fonction de chargement avec useCallback
  const loadShutter = useCallback(async () => {
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
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du volet:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // NOUVEAU : Utiliser useFocusEffect pour recharger les données quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      console.log('Shutter screen focused, reloading data...');
      loadShutter();
    }, [loadShutter])
  );

  useEffect(() => {
    loadShutter();
  }, [loadShutter]);

  // NOUVEAU : Initialiser l'édition des débits quand le volet est chargé
  useEffect(() => {
    if (shutter) {
      setEditingFlows({
        referenceFlow: shutter.referenceFlow.toString(),
        measuredFlow: shutter.measuredFlow.toString(),
        hasBeenFocused: { referenceFlow: false, measuredFlow: false }
      });
    }
  }, [shutter]);

  const handleBack = () => {
    try {
      // CORRIGÉ : Navigation intelligente selon la provenance
      if (from === 'search') {
        // Si on vient de la recherche, retourner à la recherche
        router.push('/(tabs)/search');
      } else if (zone) {
        // Sinon, retourner vers la zone (comportement normal)
        router.push(`/(tabs)/zone/${zone.id}`);
      } else {
        // Fallback vers l'accueil
        router.push('/(tabs)/');
      }
    } catch (error) {
      console.error('Erreur de navigation:', error);
      // Fallback vers l'accueil en cas d'erreur
      router.push('/(tabs)/');
    }
  };

  const handleEdit = () => {
    try {
      // NOUVEAU : Passer le paramètre 'from' à la page d'édition
      if (from === 'search') {
        router.push(`/(tabs)/shutter/edit/${id}?from=search`);
      } else {
        router.push(`/(tabs)/shutter/edit/${id}`);
      }
    } catch (error) {
      console.error('Erreur de navigation vers édition:', error);
    }
  };

  const handleDelete = async () => {
    if (!shutter) return;

    Alert.alert(
      strings.deleteShutter,
      `${strings.deleteShutterConfirm} "${shutter.name}" ?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.delete,
          style: 'destructive',
          onPress: async () => {
            await storage.deleteShutter(shutter.id);
            handleBack(); // Utilise la même logique de navigation
          }
        }
      ]
    );
  };

  // NOUVEAU : Fonction pour formater les dates
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  // NOUVEAU : Fonctions pour l'édition directe des débits
  const handleFlowChange = useCallback((field: 'referenceFlow' | 'measuredFlow', value: string) => {
    setEditingFlows(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFlowFocus = useCallback((field: 'referenceFlow' | 'measuredFlow') => {
    setEditingFlows(prev => {
      // Si c'est le premier focus ET que la valeur est "0", l'effacer
      if (!prev.hasBeenFocused[field] && prev[field] === '0') {
        return {
          ...prev,
          [field]: '', // Effacer le "0"
          hasBeenFocused: {
            ...prev.hasBeenFocused,
            [field]: true
          }
        };
      }

      // Sinon, juste marquer comme focalisé
      return {
        ...prev,
        hasBeenFocused: {
          ...prev.hasBeenFocused,
          [field]: true
        }
      };
    });
  }, []);

  const handleFlowBlur = useCallback(async (field: 'referenceFlow' | 'measuredFlow') => {
    if (!shutter) return;

    const refFlow = parseFloat(editingFlows.referenceFlow);
    const measFlow = parseFloat(editingFlows.measuredFlow);

    // Validation des valeurs
    if (isNaN(refFlow) || refFlow < 0) {
      // Restaurer la valeur originale en cas d'erreur
      setEditingFlows(prev => ({
        ...prev,
        referenceFlow: shutter.referenceFlow.toString()
      }));
      return;
    }

    if (isNaN(measFlow) || measFlow < 0) {
      // Restaurer la valeur originale en cas d'erreur
      setEditingFlows(prev => ({
        ...prev,
        measuredFlow: shutter.measuredFlow.toString()
      }));
      return;
    }

    // Vérifier si les valeurs ont changé
    const hasChanged = refFlow !== shutter.referenceFlow || measFlow !== shutter.measuredFlow;
    
    if (hasChanged) {
      try {
        // Sauvegarde automatique et silencieuse
        await storage.updateShutter(shutter.id, {
          referenceFlow: refFlow,
          measuredFlow: measFlow,
        });
        
        // CORRIGÉ : Mise à jour instantanée de l'état local
        setShutter(prevShutter => {
          if (!prevShutter) return prevShutter;
          return {
            ...prevShutter,
            referenceFlow: refFlow,
            measuredFlow: measFlow,
            updatedAt: new Date()
          };
        });
        
        console.log(`✅ Volet ${shutter.name} mis à jour instantanément: ${refFlow}/${measFlow}`);
        
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
        // En cas d'erreur, restaurer les valeurs originales
        setEditingFlows(prev => ({
          ...prev,
          referenceFlow: shutter.referenceFlow.toString(),
          measuredFlow: shutter.measuredFlow.toString()
        }));
      }
    }
  }, [editingFlows, shutter]);

  if (loading) {
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

  // Calculer la conformité avec les valeurs actuelles (éditées ou originales)
  const currentRefFlow = parseFloat(editingFlows.referenceFlow) || 0;
  const currentMeasFlow = parseFloat(editingFlows.measuredFlow) || 0;
  const compliance = calculateCompliance(currentRefFlow, currentMeasFlow);

  return (
    <View style={styles.container}>
      <Header
        title={shutter.name}
        subtitle={`${zone.name} • ${building.name} • ${project.name}`}
        onBack={handleBack}
        rightComponent={
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Settings size={20} color="#009999" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{strings.generalInfo}</Text>
            <Text style={styles.shutterType}>
              {shutter.type === 'high' ? strings.shutterHigh : strings.shutterLow}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{strings.projects.slice(0, -1)}</Text>
            <Text style={styles.infoValue}>{project.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{strings.building}</Text>
            <Text style={styles.infoValue}>{building.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{strings.smokeExtractionZone}</Text>
            <Text style={styles.infoValue}>{zone.name}</Text>
          </View>

          {/* NOUVEAU : Affichage des dates du projet */}
          {project.startDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{strings.startDate}</Text>
              <Text style={styles.infoValue}>{formatDate(project.startDate)}</Text>
            </View>
          )}

          {project.endDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{strings.endDate}</Text>
              <Text style={styles.infoValue}>{formatDate(project.endDate)}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{strings.createdOn}</Text>
            <Text style={styles.infoValue}>
              {new Intl.DateTimeFormat('fr-FR').format(new Date(shutter.createdAt))}
            </Text>
          </View>
        </View>

        {/* NOUVEAU : Édition directe des débits */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{strings.flowMeasurements}</Text>

          <View style={styles.flowEditingContainer}>
            <View style={styles.flowEditingRow}>
              <View style={styles.flowEditingField}>
                <View style={styles.flowLabelContainer}>
                  <Text style={styles.flowEditingLabel}>Débit de</Text>
                  <Text style={styles.flowEditingLabel}>référence</Text>
                  <Text style={styles.flowEditingUnit}>({strings.cubicMeterPerHour})</Text>
                </View>
                <TextInput
                  style={styles.flowEditingInput}
                  value={editingFlows.referenceFlow}
                  onChangeText={(text) => handleFlowChange('referenceFlow', text)}
                  onFocus={() => handleFlowFocus('referenceFlow')}
                  onBlur={() => handleFlowBlur('referenceFlow')}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  selectTextOnFocus={true}
                />
              </View>
              
              <View style={styles.flowEditingField}>
                <View style={styles.flowLabelContainer}>
                  <Text style={styles.flowEditingLabel}>Débit mesuré</Text>
                  <Text style={styles.flowEditingUnit}>({strings.cubicMeterPerHour})</Text>
                </View>
                <TextInput
                  style={styles.flowEditingInput}
                  value={editingFlows.measuredFlow}
                  onChangeText={(text) => handleFlowChange('measuredFlow', text)}
                  onFocus={() => handleFlowFocus('measuredFlow')}
                  onBlur={() => handleFlowBlur('measuredFlow')}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  selectTextOnFocus={true}
                />
              </View>
              
              <View style={styles.flowEditingField}>
                <View style={styles.flowLabelContainer}>
                  <Text style={styles.flowEditingLabel}>Écart</Text>
                  <Text style={styles.flowEditingUnit}>(%)</Text>
                </View>
                <View style={styles.deviationDisplay}>
                  <Text style={[styles.deviationValue, { color: compliance.color }]}>
                    {formatDeviation(compliance.deviation)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          {/* CORRIGÉ : Titre de conformité mis à jour */}
          <Text style={styles.cardTitle}>{strings.compliance} NF S61-933 Annexe H</Text>
          
          <View style={styles.complianceContainer}>
            <ComplianceIndicator compliance={compliance} size="large" />
          </View>

          {/* CORRIGÉ : Ne pas afficher le texte descriptif si c'est "référence invalide" */}
          {compliance.status !== 'non-compliant' || currentRefFlow > 0 ? (
            <Text style={styles.complianceDescription}>
              {compliance.status === 'compliant' && strings.functionalDesc}
              {compliance.status === 'acceptable' && strings.acceptableDesc}
              {compliance.status === 'non-compliant' && currentRefFlow > 0 && strings.nonCompliantDesc}
            </Text>
          ) : (
            // NOUVEAU : Message pour référence invalide
            <Text style={styles.invalidReferenceMessage}>
              Veuillez rentrer les mesures de débits
            </Text>
          )}
        </View>

        {shutter.remarks && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{strings.remarks}</Text>
            <Text style={styles.remarksText}>{shutter.remarks}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            title={strings.delete}
            onPress={handleDelete}
            variant="danger"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
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
  editButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  shutterType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    textAlign: 'right',
  },
  
  // NOUVEAU : Styles pour l'édition directe des débits
  flowEditingContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  flowEditingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flowEditingField: {
    flex: 1,
  },
  flowLabelContainer: {
    height: 44,
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  flowEditingLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    lineHeight: 12,
  },
  flowEditingUnit: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  flowEditingInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    height: 40,
  },
  deviationDisplay: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  deviationValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },

  complianceContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  complianceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  // NOUVEAU : Style pour le message de référence invalide
  invalidReferenceMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F59E0B',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  remarksText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    width: '100%',
  },
});