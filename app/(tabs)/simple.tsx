import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Clock, Trash2 } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { ComplianceIndicator } from '@/components/ComplianceIndicator';
import { Button } from '@/components/Button';
import { calculateCompliance, formatDeviation } from '@/utils/compliance';
import { storage, QuickCalcHistoryItem } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SimpleCalculatorScreen() {
  const { strings } = useLanguage();
  const [referenceFlow, setReferenceFlow] = useState('');
  const [measuredFlow, setMeasuredFlow] = useState('');
  const [history, setHistory] = useState<QuickCalcHistoryItem[]>([]);

  // Référence pour le scroll automatique
  const scrollViewRef = useRef<ScrollView>(null);

  // Charger l'historique au montage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyData = await storage.getQuickCalcHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  // Calculer la conformité en temps réel
  const getCompliance = () => {
    const ref = parseFloat(referenceFlow);
    const measured = parseFloat(measuredFlow);
    
    if (isNaN(ref) || isNaN(measured) || ref <= 0) {
      return null;
    }
    
    return calculateCompliance(ref, measured);
  };

  const compliance = getCompliance();

  // Sauvegarder le calcul dans l'historique
  const saveToHistory = async () => {
    if (!compliance) return;

    const ref = parseFloat(referenceFlow);
    const measured = parseFloat(measuredFlow);

    try {
      await storage.addQuickCalcHistory({
        referenceFlow: ref,
        measuredFlow: measured,
        deviation: compliance.deviation,
        status: compliance.status,
        color: compliance.color
      });
      
      // Recharger l'historique
      loadHistory();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans l\'historique:', error);
    }
  };

  // Effacer tout l'historique
  const clearHistory = async () => {
    try {
      await storage.clearQuickCalcHistory();
      setHistory([]);
    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'historique:', error);
    }
  };

  const clearInputs = () => {
    setReferenceFlow('');
    setMeasuredFlow('');
  };

  const getDeviationIcon = () => {
    if (!compliance) return null;
    
    const iconSize = 24;
    const iconColor = compliance.color;
    
    if (compliance.deviation > 0) {
      return <Ionicons name="trending-up" size={iconSize} color={iconColor} />;
    } else if (compliance.deviation < 0) {
      return <Ionicons name="trending-down" size={iconSize} color={iconColor} />;
    } else {
      return <Ionicons name="remove" size={iconSize} color={iconColor} />;
    }
  };

  // Formater la date pour l'affichage
  const formatHistoryDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  // CORRIGÉ : Scroll simple vers le milieu de la page
  const useHistoryItem = (item: QuickCalcHistoryItem) => {
    setReferenceFlow(item.referenceFlow.toString());
    setMeasuredFlow(item.measuredFlow.toString());
    
    // CORRIGÉ : Scroll simple vers le milieu de la page
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ 
          y: 300, // Position fixe au milieu de la page
          animated: true 
        });
      }
    }, 200);
  };

  // Fonction pour obtenir le texte de statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Fonctionnel';
      case 'acceptable':
        return 'Acceptable';
      case 'non-compliant':
        return 'Non conforme';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header 
        title={strings.quickCalc} 
        subtitle={strings.quickCalcSubtitle}
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Carte de calcul */}
        <View style={styles.calculatorCard}>
          <View style={styles.calculatorHeader}>
            <Ionicons name="calculator-outline" size={24} color="#009999" />
            <Text style={styles.cardTitle}>{strings.complianceCalculator}</Text>
          </View>

          <Input
            label={strings.referenceFlow + " (m³/h) *"}
            value={referenceFlow}
            onChangeText={setReferenceFlow}
            placeholder="Ex: 5000"
            keyboardType="numeric"
          />

          <Input
            label={strings.measuredFlow + " (m³/h) *"}
            value={measuredFlow}
            onChangeText={setMeasuredFlow}
            placeholder="Ex: 4800"
            keyboardType="numeric"
          />

          {(referenceFlow || measuredFlow) && (
            <View style={styles.clearButton}>
              <Text 
                style={styles.clearButtonText}
                onPress={clearInputs}
              >
                {strings.clearValues}
              </Text>
            </View>
          )}
        </View>

        {/* Résultats */}
        {compliance ? (
          <View style={[styles.resultCard, { borderColor: compliance.color }]}>
            <Text style={styles.resultTitle}>{strings.complianceResult}</Text>
            
            <View style={styles.deviationContainer}>
              <Text style={styles.deviationLabel}>{strings.calculatedDeviation}</Text>
              <View style={styles.deviationIcon}>
                {getDeviationIcon()}
              </View>
              <Text style={[styles.deviationValue, { color: compliance.color }]}>
                {formatDeviation(compliance.deviation)}
              </Text>
            </View>

            <View style={styles.complianceContainer}>
              <ComplianceIndicator compliance={compliance} size="large" />
            </View>

            <Text style={styles.complianceDescription}>
              {compliance.status === 'compliant' && strings.functionalDesc}
              {compliance.status === 'acceptable' && strings.acceptableDesc}
              {compliance.status === 'non-compliant' && strings.nonCompliantDesc}
            </Text>

            {/* Bouton pour sauvegarder dans l'historique */}
            <View style={styles.saveToHistoryContainer}>
              <Button
                title="Sauvegarder dans l'historique"
                onPress={saveToHistory}
                variant="secondary"
                size="small"
              />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="calculator-outline" size={48} color="#6B7280" />
            <Text style={styles.placeholderText}>
              {strings.simplifiedModeDesc}
            </Text>
          </View>
        )}

        {/* Historique COMPACT, LISIBLE et ÉLÉGANT */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View style={styles.historyTitleContainer}>
              <Clock size={18} color="#009999" />
              <Text style={styles.historyTitle}>Historique des calculs</Text>
            </View>
            {history.length > 0 && (
              <TouchableOpacity 
                style={styles.clearHistoryButton}
                onPress={clearHistory}
              >
                <Trash2 size={10} color="#EF4444" />
                <Text style={styles.clearHistoryText}>Tout effacer</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyHistoryContainer}>
              <Text style={styles.emptyHistoryText}>
                Aucun calcul effectué récemment
              </Text>
              <Text style={styles.emptyHistorySubtext}>
                Les 5 derniers calculs apparaîtront ici
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {/* Labels compacts directement au-dessus des valeurs */}
              <View style={styles.compactLabelsRow}>
                <Text style={styles.compactLabel}>Débit de réf.</Text>
                <Text style={styles.compactLabel}>Débit mesuré</Text>
                <Text style={styles.compactLabel}>Résultat</Text>
              </View>

              {history.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.compactHistoryItem}
                  onPress={() => useHistoryItem(item)}
                >
                  {/* Débit de référence */}
                  <View style={styles.compactDataColumn}>
                    <Text style={styles.compactDataValue}>
                      {item.referenceFlow.toFixed(0)}
                    </Text>
                    <Text style={styles.compactDataUnit}>m³/h</Text>
                  </View>

                  {/* Débit mesuré */}
                  <View style={styles.compactDataColumn}>
                    <Text style={styles.compactDataValue}>
                      {item.measuredFlow.toFixed(0)}
                    </Text>
                    <Text style={styles.compactDataUnit}>m³/h</Text>
                  </View>

                  {/* Résultat avec statut et date */}
                  <View style={styles.compactResultColumn}>
                    <Text style={[styles.compactResultValue, { color: item.color }]}>
                      {formatDeviation(item.deviation)}
                    </Text>
                    <Text style={[styles.compactStatusText, { color: item.color }]}>
                      {getStatusText(item.status)}
                    </Text>
                    <Text style={styles.compactTimeText}>
                      {formatHistoryDate(item.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Informations sur la norme */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>NF S61-933 Annexe H</Text>
          <Text style={styles.infoText}>
            {strings.nfStandardDesc}:
            {'\n\n'}
            • <Text style={{ color: '#10B981', fontFamily: 'Inter-SemiBold' }}>{strings.compliant}</Text> : {strings.deviation} ≤ ±10%
            {'\n'}
            • <Text style={{ color: '#F59E0B', fontFamily: 'Inter-SemiBold' }}>{strings.acceptable}</Text> : {strings.deviation} ±10% - ±20%
            {'\n'}
            • <Text style={{ color: '#EF4444', fontFamily: 'Inter-SemiBold' }}>{strings.nonCompliant}</Text> : {strings.deviation} > ±20%
          </Text>
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
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  calculatorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  deviationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deviationLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  deviationValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  deviationIcon: {
    marginBottom: 12,
  },
  complianceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  complianceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  saveToHistoryContainer: {
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  clearButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },

  // Styles pour l'historique COMPACT, LISIBLE et ÉLÉGANT
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
  },
  clearHistoryText: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyHistoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyHistorySubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  historyList: {
    gap: 1,
  },
  
  // Labels compacts directement au-dessus des valeurs
  compactLabelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  compactLabel: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  
  // Lignes de l'historique ultra-compactes et élégantes
  compactHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  
  // Colonnes de données (débits) - COMPACTES
  compactDataColumn: {
    flex: 1,
    alignItems: 'center',
  },
  compactDataValue: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 1,
  },
  compactDataUnit: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  
  // Colonne résultat (écart + statut + date) - COMPACTE
  compactResultColumn: {
    flex: 1,
    alignItems: 'center',
  },
  compactResultValue: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  compactStatusText: {
    fontSize: 9,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  compactTimeText: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
});