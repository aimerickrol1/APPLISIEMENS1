import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { DateInput } from '@/components/DateInput';
import { Button } from '@/components/Button';
import { Project } from '@/types';
import { storage } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EditProjectScreen() {
  const { strings } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; startDate?: string; endDate?: string }>({});

  // NOUVEAU : Détecter le thème système
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadProject();
  }, [id]);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const loadProject = async () => {
    try {
      const projects = await storage.getProjects();
      const foundProject = projects.find(p => p.id === id);
      if (foundProject) {
        setProject(foundProject);
        setName(foundProject.name);
        setCity(foundProject.city || '');
        setStartDate(foundProject.startDate ? formatDate(new Date(foundProject.startDate)) : '');
        setEndDate(foundProject.endDate ? formatDate(new Date(foundProject.endDate)) : '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // CORRIGÉ : Retourner vers la page d'accueil des projets (d'où on vient)
  const handleBack = () => {
    try {
      // Navigation forcée vers la page d'accueil des projets
      router.push('/(tabs)/');
    } catch (error) {
      console.error('Erreur de navigation:', error);
      router.push('/(tabs)/');
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; startDate?: string; endDate?: string } = {};

    if (!name.trim()) {
      newErrors.name = strings.nameRequired;
    }

    // Validation des dates si elles sont renseignées
    if (startDate && !isValidDate(startDate)) {
      newErrors.startDate = strings.invalidDate;
    }

    if (endDate && !isValidDate(endDate)) {
      newErrors.endDate = strings.invalidDate;
    }

    // Vérifier que la date de fin est après la date de début
    if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      if (end <= start) {
        newErrors.endDate = strings.endDateAfterStart;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(regex);
    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };

  const handleSave = async () => {
    if (!validateForm() || !project) return;

    setLoading(true);
    try {
      const updateData: any = {
        name: name.trim(),
        city: city.trim() || undefined,
      };

      if (startDate && isValidDate(startDate)) {
        updateData.startDate = parseDate(startDate);
      } else if (!startDate) {
        updateData.startDate = undefined;
      }

      if (endDate && isValidDate(endDate)) {
        updateData.endDate = parseDate(endDate);
      } else if (!endDate) {
        updateData.endDate = undefined;
      }

      const updatedProject = await storage.updateProject(project.id, updateData);

      if (updatedProject) {
        // CORRIGÉ : Retourner vers la page d'accueil des projets (d'où on vient)
        router.push('/(tabs)/');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du projet:', error);
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

  if (!project) {
    return (
      <View style={styles.container}>
        <Header title={strings.itemNotFound} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{strings.dataNotFound}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header
        title={strings.editProject}
        onBack={handleBack}
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={`${strings.projectName} *`}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Mesures centre commercial Rivoli"
          error={errors.name}
        />

        <Input
          label={`${strings.city} (${strings.optional})`}
          value={city}
          onChangeText={setCity}
          placeholder="Ex: Paris, Lyon, Marseille"
        />

        <DateInput
          label={`${strings.startDate} (${strings.optional})`}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="JJ/MM/AAAA"
          error={errors.startDate}
        />

        <DateInput
          label={`${strings.endDate} (${strings.optional})`}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="JJ/MM/AAAA"
          error={errors.endDate}
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