import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Project, Building } from '@/types';
import { storage } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EditBuildingScreen() {
  const { strings } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [building, setBuilding] = useState<Building | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // NOUVEAU : Détecter le thème système
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadBuilding();
  }, [id]);

  const loadBuilding = async () => {
    try {
      const projects = await storage.getProjects();
      for (const proj of projects) {
        const foundBuilding = proj.buildings.find(b => b.id === id);
        if (foundBuilding) {
          setBuilding(foundBuilding);
          setProject(proj);
          setName(foundBuilding.name);
          setDescription(foundBuilding.description || '');
          break;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du bâtiment:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // CORRIGÉ : Retourner vers la page du projet (d'où on vient)
  const handleBack = () => {
    try {
      if (project) {
        router.push(`/(tabs)/project/${project.id}`);
      } else {
        router.push('/(tabs)/');
      }
    } catch (error) {
      console.error('Erreur de navigation:', error);
      router.push('/(tabs)/');
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = strings.nameRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !building) return;

    setLoading(true);
    try {
      const updatedBuilding = await storage.updateBuilding(building.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (updatedBuilding) {
        // CORRIGÉ : Retourner vers la page du projet (d'où on vient)
        if (project) {
          router.push(`/(tabs)/project/${project.id}`);
        } else {
          router.push('/(tabs)/');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification du bâtiment:', error);
    } finally {
      setLoading(false);
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

  if (!building || !project) {
    return (
      <View style={styles.container}>
        <Header title={strings.itemNotFound} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{strings.dataNotFound}</Text>
        </View>
      </View>
    );
  }

  const locationInfo = project.city ? `${project.name} • ${project.city}` : project.name;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={strings.editBuilding}
        subtitle={locationInfo}
        onBack={handleBack}
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={`${strings.buildingName} *`}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Bâtiment A, Tour Nord"
          error={errors.name}
        />

        <Input
          label={`${strings.description} (${strings.optional})`}
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Bâtiment principal, 5 étages"
          multiline
          numberOfLines={3}
        />

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
  buttonContainer: {
    marginTop: 24,
  },
});