import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, useColorScheme } from 'react-native';
import { Settings as SettingsIcon, Globe, Trash2, Download, Info, Database, ChevronRight, CircleCheck as CheckCircle, X } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { storage } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLanguageOptions, SupportedLanguage } from '@/utils/i18n';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { strings, currentLanguage, changeLanguage } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [clearDataModalVisible, setClearDataModalVisible] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    projectsCount: number;
    totalShutters: number;
    storageSize: string;
  } | null>(null);

  // NOUVEAU : Détecter le thème système
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await storage.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Erreur lors du chargement des infos de stockage:', error);
    }
  };

  // CORRIGÉ : Navigation spécifique et forcée vers la page d'accueil des projets
  const handleBack = () => {
    try {
      // SOLUTION 1 : Utiliser router.dismiss() si on est dans un modal/stack
      if (router.canDismiss()) {
        router.dismiss();
        return;
      }
      
      // SOLUTION 2 : Navigation directe vers l'index des tabs
      router.navigate('/(tabs)/');
    } catch (error) {
      console.error('Erreur de navigation:', error);
      // SOLUTION 3 : Fallback ultime
      try {
        router.push('/(tabs)/');
      } catch (fallbackError) {
        console.error('Erreur de navigation fallback:', fallbackError);
      }
    }
  };

  const handleLanguageSelect = (languageCode: SupportedLanguage) => {
    changeLanguage(languageCode);
    setLanguageModalVisible(false);
  };

  const handleClearAllData = () => {
    setClearDataModalVisible(true);
  };

  const confirmClearData = async () => {
    try {
      await storage.clearAllData();
      setClearDataModalVisible(false);
      Alert.alert(
        strings.dataCleared,
        strings.dataClearedDesc,
        [{ 
          text: strings.ok, 
          onPress: () => {
            loadStorageInfo();
            // CORRIGÉ : Navigation forcée vers l'accueil après suppression
            try {
              if (router.canDismiss()) {
                router.dismiss();
              } else {
                router.navigate('/(tabs)/');
              }
            } catch (error) {
              router.push('/(tabs)/');
            }
          }
        }]
      );
    } catch (error) {
      Alert.alert(
        strings.error,
        'Impossible de supprimer les données. Veuillez réessayer.',
        [{ text: strings.ok }]
      );
    }
  };

  const handleExportData = () => {
    router.push('/(tabs)/export');
  };

  const handleAbout = () => {
    router.push('/(tabs)/about');
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightContent?: React.ReactNode,
    danger?: boolean
  ) => (
    <TouchableOpacity 
      style={[styles.settingItem, danger && styles.settingItemDanger]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          {icon}
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightContent || (onPress && <ChevronRight size={20} color="#9CA3AF" />)}
    </TouchableOpacity>
  );

  const currentLangOption = getLanguageOptions().find(opt => opt.code === currentLanguage);

  return (
    <View style={styles.container}>
      <Header 
        title={strings.settingsTitle} 
        subtitle={strings.settingsSubtitle}
        onBack={handleBack}
        showSettings={false}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Section Langue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 {strings.languageAndRegion}</Text>
          
          {renderSettingItem(
            <Globe size={20} color="#009999" />,
            strings.interfaceLanguage,
            `${currentLangOption?.flag} ${currentLangOption?.name}`,
            () => setLanguageModalVisible(true)
          )}
        </View>

        {/* Section Données */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 {strings.dataManagement}</Text>
          
          {storageInfo && renderSettingItem(
            <Database size={20} color="#009999" />,
            strings.storageUsed,
            `${storageInfo.projectsCount} projets • ${storageInfo.totalShutters} volets • ${storageInfo.storageSize}`
          )}

          {renderSettingItem(
            <Download size={20} color="#10B981" />,
            strings.exportMyData,
            strings.exportMyDataDesc,
            handleExportData
          )}

          {renderSettingItem(
            <Trash2 size={20} color="#EF4444" />,
            strings.clearAllData,
            strings.clearAllDataDesc,
            handleClearAllData,
            undefined,
            true
          )}
        </View>

        {/* Section Application */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ {strings.applicationSection}</Text>
          
          {renderSettingItem(
            <Info size={20} color="#009999" />,
            strings.about,
            'Version, développeur, conformité',
            handleAbout
          )}
        </View>
      </ScrollView>

      {/* Modal Langue */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            <View style={styles.modalHeader}>
              <Globe size={32} color="#009999" />
              <Text style={styles.modalTitle}>{strings.selectLanguage}</Text>
              <TouchableOpacity 
                onPress={() => setLanguageModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.translationNote}>
              <Text style={styles.translationNoteTitle}>{strings.approximateTranslations}</Text>
              <Text style={styles.translationNoteText}>
                {strings.translationNote}
              </Text>
            </View>
            
            <View style={styles.languageList}>
              {getLanguageOptions().map((option) => (
                <TouchableOpacity
                  key={option.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === option.code && styles.languageOptionSelected
                  ]}
                  onPress={() => handleLanguageSelect(option.code)}
                >
                  <Text style={styles.languageFlag}>{option.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    currentLanguage === option.code && styles.languageNameSelected
                  ]}>
                    {option.name}
                  </Text>
                  {currentLanguage === option.code && (
                    <CheckCircle size={20} color="#009999" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmation suppression */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={clearDataModalVisible}
        onRequestClose={() => setClearDataModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{strings.clearAllDataConfirm}</Text>
            </View>
            
            <Text style={styles.modalText}>
              ⚠️ <Text style={styles.modalBold}>{strings.clearAllDataWarning}</Text>
              {'\n\n'}
              Tous vos projets, bâtiments, zones et volets seront définitivement supprimés.
              {'\n\n'}
              Assurez-vous d'avoir exporté vos données importantes avant de continuer.
            </Text>

            <View style={styles.modalFooter}>
              <Button
                title={strings.cancel}
                onPress={() => setClearDataModalVisible(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Supprimer tout"
                onPress={confirmClearData}
                variant="danger"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItemDanger: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDanger: {
    backgroundColor: '#FEF2F2',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  settingTitleDanger: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  languageModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 450,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalBold: {
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  translationNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  translationNoteTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 4,
  },
  translationNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 16,
  },
  languageList: {
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  languageOptionSelected: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#009999',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  languageNameSelected: {
    color: '#009999',
    fontFamily: 'Inter-SemiBold',
  },
});