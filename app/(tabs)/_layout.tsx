import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  const { strings } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        animationDuration: 250,
        tabBarStyle: {
          backgroundColor: '#009999',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8, // RÉDUIT : iOS 34→20, Android 16→8
          paddingTop: 12, // RÉDUIT : 24→12
          height: Platform.OS === 'ios' ? 68 : 56, // RÉDUIT : iOS 96→68, Android 80→56
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginTop: -4, // AJUSTÉ : -8→-4 pour un centrage parfait
          marginBottom: 0,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: strings.projects,
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="simple"
        options={{
          title: strings.quickCalc,
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="calculator-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: strings.search,
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="export"
        options={{
          title: strings.export,
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: strings.about,
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
      {/* NOUVEAU : Onglet Paramètres caché */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Caché de la barre de navigation
          title: 'Paramètres',
        }}
      />
      <Tabs.Screen
        name="project"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="building"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="zone"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="shutter"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}