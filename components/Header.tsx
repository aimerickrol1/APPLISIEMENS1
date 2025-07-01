import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { router } from 'expo-router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showSettings?: boolean;
}

export function Header({ title, subtitle, onBack, rightComponent, showSettings = true }: HeaderProps) {
  const { strings } = useLanguage();

  const handleSettingsPress = () => {
    try {
      router.push('/(tabs)/settings');
    } catch (error) {
      console.error('Erreur de navigation vers paramètres:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barre supérieure avec logo plus grand et bouton paramètres TOUJOURS visible */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          {/* Logo Siemens plus grand et centré */}
          <View style={styles.logoSection}>
            <Image 
              source={require('../assets/images/Siemens-Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Icône paramètres TOUJOURS affichée (sauf si explicitement désactivée) */}
          {showSettings && (
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={22} color="#009999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Header principal avec navigation */}
      <View style={styles.mainHeader}>
        <View style={styles.left}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#009999" />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        {rightComponent && (
          <View style={styles.right}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 44,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  // Structure horizontale simple : logo centré + bouton à droite
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 40,
  },
  // Logo Siemens plus grand et centré
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    height: 36,
    width: 119,
  },
  // Bouton paramètres positionné absolument à droite
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -11 }], // Centrer verticalement (22/2 = 11)
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  right: {
    marginLeft: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
});