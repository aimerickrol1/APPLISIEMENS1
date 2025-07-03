import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { DateInput } from '@/components/DateInput';
import { Project, Building as BuildingType } from '@/types';
import { storage } from '@/utils/storage';
import { calculateCompliance } from '@/utils/compliance';
import { useLanguage } from '@/contexts/LanguageContext';

// INTERFACES POUR LA PRÉDÉFINITION SIMPLE
interface SimplePreDefinition {
  buildings: number;
  zonesPerBuilding: number;
  shuttersPerZone: {
    high: number;
    low: number;
  };
}

export default function ProjectsScreen() {
  const { strings, currentLanguage } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [favoriteProjects, setFavoriteProjects] = useState<Set<string>>(new Set());
  
  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectCity, setProjectCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; startDate?: string; endDate?: string }>({});

  // PRÉDÉFINITION SIMPLE
  const [createWithStructure, setCreateWithStructure] = useState(false);
  const [preDefinition, setPreDefinition] = useState<SimplePreDefinition>({
    buildings: 1,
    zonesPerBuilding: 1,
    shuttersPerZone: {
      high: 1,
      low: 1
    }
  });

  // Référence pour le scroll automatique
  const scrollViewRef = useRef<ScrollView>(null);
  const predefinitionRef = useRef<View>(null);

  // NOUVEAU : Fonction pour obtenir le préfixe selon la langue et le type
  const getShutterPrefix = (shutterType: 'high' | 'low', language: string) => {
    const prefixes = {
      fr: { high: 'VH', low: 'VB' },      // Français : Volet Haut / Volet Bas
      en: { high: 'HS', low: 'LS' },      // Anglais : High Shutter / Low Shutter
      es: { high: 'CA', low: 'CB' },      // Espagnol : Compuerta Alta / Compuerta Baja
      it: { high: 'SA', low: 'SB' },      // Italien : Serranda Alta / Serranda Bassa
    };
    
    return prefixes[language as keyof typeof prefixes]?.[shutterType] || prefixes.fr[shutterType];
  };

  useEffect(() => {
    loadProjects();
    loadFavorites();
  }, []);

  const loadProjects = async () => {
    try {
      const projectList = await storage.getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favorites = await storage.getFavoriteProjects();
      setFavoriteProjects(new Set(favorites));
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  const resetForm = () => {
    setProjectName('');
    setProjectCity('');
    setStartDate('');
    setEndDate('');
    setErrors({});
    setCreateWithStructure(false);
    setPreDefinition({
      buildings: 1,
      zonesPerBuilding: 1,
      shuttersPerZone: {
        high: 1,
        low: 1
      }
    });
  };

  const handleCreateProject = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const handleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedProjects(new Set());
  };

  const handleProjectSelection = (projectId: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedProjects.size === 0) return;

    Alert.alert(
      strings.delete + ' ' + strings.projects.toLowerCase(),
      `Êtes-vous sûr de vouloir supprimer ${selectedProjects.size} projet${selectedProjects.size > 1 ? 's' : ''} ?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.delete,
          style: 'destructive',
          onPress: async () => {
            for (const projectId of selectedProjects) {
              await storage.deleteProject(projectId);
            }
            setSelectedProjects(new Set());
            setSelectionMode(false);
            loadProjects();
          }
        }
      ]
    );
  };

  const handleBulkFavorite = async () => {
    if (selectedProjects.size === 0) return;

    const newFavorites = new Set(favoriteProjects);
    for (const projectId of selectedProjects) {
      if (newFavorites.has(projectId)) {
        newFavorites.delete(projectId);
      } else {
        newFavorites.add(projectId);
      }
    }
    
    setFavoriteProjects(newFavorites);
    await storage.setFavoriteProjects(Array.from(newFavorites));
    setSelectedProjects(new Set());
    setSelectionMode(false);
  };

  const handleToggleFavorite = async (projectId: string) => {
    const newFavorites = new Set(favoriteProjects);
    if (newFavorites.has(projectId)) {
      newFavorites.delete(projectId);
    } else {
      newFavorites.add(projectId);
    }
    
    setFavoriteProjects(newFavorites);
    await storage.setFavoriteProjects(Array.from(newFavorites));
  };

  const validateForm = () => {
    const newErrors: { name?: string; startDate?: string; endDate?: string } = {};

    if (!projectName.trim()) {
      newErrors.name = strings.nameRequired;
    }

    if (startDate && !isValidDate(startDate)) {
      newErrors.startDate = strings.invalidDate;
    }

    if (endDate && !isValidDate(endDate)) {
      newErrors.endDate = strings.invalidDate;
    }

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

  // CRÉATION DE LA STRUCTURE PRÉDÉFINIE SIMPLE - AVEC PRÉFIXES ADAPTÉS À LA LANGUE
  const createPredefinedStructure = async (projectId: string) => {
    try {
      for (let b = 1; b <= preDefinition.buildings; b++) {
        const buildingLetter = String.fromCharCode(64 + b); // A, B, C...
        const building = await storage.createBuilding(projectId, {
          name: `${strings.building} ${buildingLetter}`,
          description: undefined,
        });

        if (building) {
          for (let z = 1; z <= preDefinition.zonesPerBuilding; z++) {
            const zone = await storage.createFunctionalZone(building.id, {
              name: `ZF${z.toString().padStart(2, '0')}`,
              description: undefined,
            });

            if (zone) {
              // NOUVEAU : Créer les volets hauts avec préfixe adapté à la langue
              for (let vh = 1; vh <= preDefinition.shuttersPerZone.high; vh++) {
                const highPrefix = getShutterPrefix('high', currentLanguage);
                await storage.createShutter(zone.id, {
                  name: `${highPrefix}${vh.toString().padStart(2, '0')}`,
                  type: 'high',
                  referenceFlow: 0,
                  measuredFlow: 0,
                });
              }

              // NOUVEAU : Créer les volets bas avec préfixe adapté à la langue
              for (let vb = 1; vb <= preDefinition.shuttersPerZone.low; vb++) {
                const lowPrefix = getShutterPrefix('low', currentLanguage);
                await storage.createShutter(zone.id, {
                  name: `${lowPrefix}${vb.toString().padStart(2, '0')}`,
                  type: 'low',
                  referenceFlow: 0,
                  measuredFlow: 0,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création de la structure:', error);
    }
  };

  const handleSubmitProject = async () => {
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const projectData: any = {
        name: projectName.trim(),
      };

      if (projectCity.trim()) {
        projectData.city = projectCity.trim();
      }

      if (startDate && isValidDate(startDate)) {
        projectData.startDate = parseDate(startDate);
      }

      if (endDate && isValidDate(endDate)) {
        projectData.endDate = parseDate(endDate);
      }

      const project = await storage.createProject(projectData);

      // Créer la structure prédéfinie si demandée
      if (createWithStructure) {
        await createPredefinedStructure(project.id);
      }

      setCreateModalVisible(false);
      resetForm();
      loadProjects();
      
      // Navigation directe vers le projet créé
      router.push(`/(tabs)/project/${project.id}`);
    } catch (error) {
      Alert.alert(strings.error, 'Impossible de créer le projet. Veuillez réessayer.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleProjectPress = (project: Project) => {
    if (selectionMode) {
      handleProjectSelection(project.id);
    } else {
      router.push(`/(tabs)/project/${project.id}`);
    }
  };

  const handleEditProject = (project: Project) => {
    router.push(`/(tabs)/project/edit/${project.id}`);
  };

  const handleDeleteProject = async (project: Project) => {
    Alert.alert(
      strings.delete + ' ' + strings.projects.toLowerCase().slice(0, -1),
      `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.delete,
          style: 'destructive',
          onPress: async () => {
            await storage.deleteProject(project.id);
            loadProjects();
          }
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  // CORRIGÉ : Fonction complète pour calculer les statistiques de conformité
  const getProjectStats = (project: Project)  => {
    const buildingCount = project.buildings.length;
    const zoneCount = project.buildings.reduce((total, building) => total + building.functionalZones.length, 0);
    const shutterCount = project.buildings.reduce((total, building) => 
      total + building.functionalZones.reduce((zoneTotal, zone) => zoneTotal + zone.shutters.length, 0), 0
    );

    let compliantCount = 0;
    let acceptableCount = 0;
    let nonCompliantCount = 0;

    project.buildings.forEach(building => {
      building.functionalZones.forEach(zone => {
        zone.shutters.forEach(shutter => {
          const compliance = calculateCompliance(shutter.referenceFlow, shutter.measuredFlow);
          switch (compliance.status) {
            case 'compliant':
              compliantCount++;
              break;
            case 'acceptable':
              acceptableCount++;
              break;
            case 'non-compliant':
              nonCompliantCount++;
              break;
          }
        });
      });
    });

    // CORRIGÉ : Calcul de conformité incluant les volets "acceptables" comme conformes
    const conformeTotal = compliantCount + acceptableCount;
    const complianceRate = shutterCount > 0 ? (conformeTotal / shutterCount) * 100 : 0;

    return {
      buildingCount,
      zoneCount,
      shutterCount,
      compliantCount,
      acceptableCount,
      nonCompliantCount,
      complianceRate
    };
  };

  // Fonction pour déterminer la taille de police adaptative
  const getAdaptiveFontSize = (text: string, hasActions: boolean) => {
    const baseSize = 20;
    const minSize = 16;
    const maxLength = hasActions ? 30 : 40;
    
    if (text.length <= maxLength) {
      return baseSize;
    } else if (text.length <= maxLength + 10) {
      return 18;
    } else {
      return minSize;
    }
  };

  // Trier les projets : favoris en premier
  const sortedProjects = [...projects].sort((a, b) => {
    const aIsFavorite = favoriteProjects.has(a.id);
    const bIsFavorite = favoriteProjects.has(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  // CALCUL DU TOTAL POUR L'APERÇU SIMPLE
  const getTotalElements = () => {
    const totalBuildings = preDefinition.buildings;
    const totalZones = preDefinition.buildings * preDefinition.zonesPerBuilding;
    const totalShutters = totalZones * (preDefinition.shuttersPerZone.high + preDefinition.shuttersPerZone.low);
    return { totalBuildings, totalZones, totalShutters };
  };

  // FONCTION AMÉLIORÉE POUR ACTIVER LA PRÉDÉFINITION ET SCROLLER PRÉCISÉMENT
  const handleTogglePredefinition = () => {
    const newValue = !createWithStructure;
    setCreateWithStructure(newValue);
    
    // Si on active la prédéfinition, scroller vers la section après un délai
    if (newValue && scrollViewRef.current && predefinitionRef.current) {
      setTimeout(() => {
        predefinitionRef.current?.measureInWindow((x, y, width, height) => {
          // Scroller pour que la section soit visible avec un peu de marge
          scrollViewRef.current?.scrollTo({ 
            y: y - 100, // 100px de marge au-dessus
            animated: true 
          });
        });
      }, 300);
    }
  };

  const renderProject = ({ item }: { item: Project }) => {
    const stats = getProjectStats(item);
    const isSelected = selectedProjects.has(item.id);
    const isFavorite = favoriteProjects.has(item.id);
    const hasActions = !selectionMode;
    const adaptiveFontSize = getAdaptiveFontSize(item.name, hasActions);

    return (
      <TouchableOpacity
        style={[
          styles.projectCard,
          isSelected && styles.selectedCard,
          isFavorite && styles.favoriteCard
        ]}
        onPress={() => handleProjectPress(item)}
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            handleProjectSelection(item.id);
          }
        }}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleSection}>
            <View style={styles.titleRow}>
              {selectionMode && (
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleProjectSelection(item.id)}
                >
                  {isSelected ? (
                    <Ionicons name="checkbox" size={20} color="#009999" />
                  ) : (
                    <Ionicons name="square-outline" size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              )}
              <Text 
                style={[styles.projectName, { fontSize: adaptiveFontSize }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
            </View>
            {item.city && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color="#009999" />
                <Text style={styles.cityText}>{item.city}</Text>
              </View>
            )}
            {/* NOUVEAU : Affichage des dates de début et fin du projet */}
            {(item.startDate || item.endDate) && (
              <View style={styles.projectDatesContainer}>
                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                <Text style={styles.projectDatesText}>
                  {item.startDate && formatDate(item.startDate)}
                  {item.startDate && item.endDate && ' → '}
                  {item.endDate && formatDate(item.endDate)}
                </Text>
              </View>
            )}
          </View>
          
          {!selectionMode && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleToggleFavorite(item.id)}
              >
                <Ionicons 
                  name={isFavorite ? "star" : "star-outline"} 
                  size={16} 
                  color={isFavorite ? "#F59E0B" : "#9CA3AF"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditProject(item)}
              >
                <Ionicons name="settings-outline" size={16} color="#009999" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteProject(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* CORRIGÉ : ALIGNEMENT PARFAIT DES STATISTIQUES */}
        <View style={styles.projectContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="business-outline" size={20} color="#009999" />
              </View>
              <Text style={styles.statValue}>{stats.buildingCount}</Text>
              <Text style={styles.statLabel}>{strings.buildings}</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="layers-outline" size={20} color="#009999" />
              </View>
              <Text style={styles.statValue}>{stats.zoneCount}</Text>
              <Text style={styles.statLabel}>{strings.zones}</Text>
            </View>
            
            {/* CORRIGÉ : Alignement parfait de la conformité */}
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <View style={[styles.complianceIndicator, { 
                  backgroundColor: stats.complianceRate >= 80 ? '#10B981' : stats.complianceRate >= 60 ? '#F59E0B' : '#EF4444' 
                }]} />
              </View>
              <Text style={styles.statValue}>{stats.complianceRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>{strings.compliance}</Text>
            </View>
          </View>

          {/* Barre de progression et détail des volets - MODIFIÉ EN VERTICAL */}
          {stats.shutterCount > 0 && (
            <View style={styles.complianceSection}>
              <View style={styles.complianceBar}>
                <View style={[styles.complianceSegment, { 
                  flex: stats.compliantCount, 
                  backgroundColor: '#10B981' 
                }]} />
                <View style={[styles.complianceSegment, { 
                  flex: stats.acceptableCount, 
                  backgroundColor: '#F59E0B' 
                }]} />
                <View style={[styles.complianceSegment, { 
                  flex: stats.nonCompliantCount, 
                  backgroundColor: '#EF4444' 
                }]} />
              </View>
              
              <View style={styles.complianceDetails}>
                {/* Nombre total de volets en premier */}
                <View style={styles.complianceDetailRow}>
                  <Text style={styles.complianceDetailText}>
                    {stats.shutterCount} {strings.shutters.toLowerCase()}
                  </Text>
                </View>
                
                {/* Détails en vertical au lieu d'horizontal */}
                <View style={styles.complianceDetailColumn}>
                  <View style={styles.complianceDetailItem}>
                    <View style={[styles.complianceDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.complianceDetailLabel}>
                      {stats.compliantCount} {strings.compliant}
                    </Text>
                  </View>
                  <View style={styles.complianceDetailItem}>
                    <View style={[styles.complianceDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.complianceDetailLabel}>
                      {stats.acceptableCount} {strings.acceptable}
                    </Text>
                  </View>
                  <View style={styles.complianceDetailItem}>
                    <View style={[styles.complianceDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.complianceDetailLabel}>
                      {stats.nonCompliantCount} {strings.nonCompliant}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.projectFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color="#6B7280" />
            <Text style={styles.dateText}>{strings.createdOn} {formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={strings.projects} showSettings={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{strings.loading}</Text>
        </View>
      </View>
    );
  }

  const { totalBuildings, totalZones, totalShutters } = getTotalElements();

  return (
    <View style={styles.container}>
      <Header 
        title={strings.projectsTitle}
        subtitle={strings.projectsSubtitle}
        showSettings={true}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSelectionMode} style={styles.selectionButton}>
              <Text style={styles.selectionButtonText}>
                {selectionMode ? strings.cancel : 'Sélect.'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateProject} style={styles.addButton}>
              <Ionicons name="add" size={22} color="#009999" />
            </TouchableOpacity>
          </View>
        }
      />

      {selectionMode && (
        <View style={styles.selectionToolbar}>
          <Text style={styles.selectionCount}>
            {selectedProjects.size} {strings.selected}{selectedProjects.size > 1 ? 's' : ''}
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleBulkFavorite}
              disabled={selectedProjects.size === 0}
            >
              <Ionicons name="star-outline" size={20} color={selectedProjects.size > 0 ? "#F59E0B" : "#9CA3AF"} />
              <Text style={[styles.toolbarButtonText, { color: selectedProjects.size > 0 ? "#F59E0B" : "#9CA3AF" }]}>
                {strings.favorites}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleBulkDelete}
              disabled={selectedProjects.size === 0}
            >
              <Ionicons name="trash-outline" size={20} color={selectedProjects.size > 0 ? "#EF4444" : "#9CA3AF"} />
              <Text style={[styles.toolbarButtonText, { color: selectedProjects.size > 0 ? "#EF4444" : "#9CA3AF" }]}>
                {strings.delete}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.content}>
        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{strings.noProjects}</Text>
            <Text style={styles.emptySubtitle}>
              {strings.noProjectsDesc}
            </Text>
            <Button
              title={strings.createProject}
              onPress={handleCreateProject}
              style={styles.createButton}
            />
          </View>
        ) : (
          <FlatList
            data={sortedProjects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* MODAL AVEC PRÉDÉFINITION SIMPLE */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{strings.newProject}</Text>
              <TouchableOpacity 
                onPress={() => setCreateModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
            >
              <Input
                label={strings.projectName + " *"}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Ex: Mesures centre commercial Rivoli"
                error={errors.name}
              />

              <Input
                label={strings.city + " (" + strings.optional + ")"}
                value={projectCity}
                onChangeText={setProjectCity}
                placeholder="Ex: Paris, Lyon, Marseille"
              />

              <DateInput
                label={strings.startDate + " (" + strings.optional + ")"}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="JJ/MM/AAAA"
                error={errors.startDate}
              />

              <DateInput
                label={strings.endDate + " (" + strings.optional + ")"}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="JJ/MM/AAAA"
                error={errors.endDate}
              />

              {/* SECTION PRÉDÉFINITION SIMPLE AVEC RÉFÉRENCE */}
              <View 
                ref={predefinitionRef}
                style={styles.predefinedSection}
              >
                <TouchableOpacity 
                  style={styles.predefinedToggle}
                  onPress={handleTogglePredefinition}
                >
                  <View style={styles.toggleHeader}>
                    <View style={styles.toggleTitleContainer}>
                      <Text style={styles.predefinedTitle}>
                        🏗️ {strings.predefineStructure} ({strings.optional})
                      </Text>
                      <Text style={styles.predefinedSubtitle}>
                        {strings.predefineStructureDesc}
                      </Text>
                    </View>
                    <View style={styles.toggleSwitch}>
                      <View style={[styles.switchTrack, createWithStructure && styles.switchTrackActive]}>
                        <View style={[styles.switchThumb, createWithStructure && styles.switchThumbActive]} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {createWithStructure && (
                  <View style={styles.predefinedContent}>
                    {/* Nombre de bâtiments */}
                    <View style={styles.quantitySection}>
                      <Text style={styles.quantityLabel}>🏢 {strings.buildings} (max 10)</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => setPreDefinition(prev => ({ 
                            ...prev, 
                            buildings: Math.max(1, prev.buildings - 1) 
                          }))}
                        >
                          <Ionicons name="remove" size={12} color="#009999" />
                        </TouchableOpacity>
                        
                        {/* CORRIGÉ : Input compact pour édition directe */}
                        <TextInput
                          style={styles.quantityInput}
                          value={preDefinition.buildings.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 1;
                            const clampedNum = Math.max(1, Math.min(10, num));
                            setPreDefinition(prev => ({ ...prev, buildings: clampedNum }));
                          }}
                          keyboardType="numeric"
                          maxLength={2}
                          selectTextOnFocus={true}
                        />
                        
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => setPreDefinition(prev => ({ 
                            ...prev, 
                            buildings: Math.min(10, prev.buildings + 1) 
                          }))}
                        >
                          <Ionicons name="add" size={12} color="#009999" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Nombre de zones par bâtiment */}
                    <View style={styles.quantitySection}>
                      <Text style={styles.quantityLabel}>🌪️ {strings.zonesPerBuilding} (max 20)</Text>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => setPreDefinition(prev => ({ 
                            ...prev, 
                            zonesPerBuilding: Math.max(1, prev.zonesPerBuilding - 1) 
                          }))}
                        >
                          <Ionicons name="remove" size={12} color="#009999" />
                        </TouchableOpacity>
                        
                        {/* CORRIGÉ : Input compact pour édition directe */}
                        <TextInput
                          style={styles.quantityInput}
                          value={preDefinition.zonesPerBuilding.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 1;
                            const clampedNum = Math.max(1, Math.min(20, num));
                            setPreDefinition(prev => ({ ...prev, zonesPerBuilding: clampedNum }));
                          }}
                          keyboardType="numeric"
                          maxLength={2}
                          selectTextOnFocus={true}
                        />
                        
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={() => setPreDefinition(prev => ({ 
                            ...prev, 
                            zonesPerBuilding: Math.min(20, prev.zonesPerBuilding + 1) 
                          }))}
                        >
                          <Ionicons name="add" size={12} color="#009999" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Volets par zone */}
                    <View style={styles.shutterSection}>
                      <Text style={styles.quantityLabel}>🔲 {strings.shuttersPerZone} (max 30)</Text>
                      
                      {/* Volets Hauts */}
                      <View style={styles.shutterTypeRow}>
                        <View style={styles.shutterTypeLabel}>
                          <View style={[styles.shutterTypeIndicator, { backgroundColor: '#10B981' }]} />
                          <Text style={styles.shutterTypeText}>{strings.shutterHigh} ({getShutterPrefix('high', currentLanguage)})</Text>
                        </View>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => setPreDefinition(prev => ({ 
                              ...prev, 
                              shuttersPerZone: {
                                ...prev.shuttersPerZone,
                                high: Math.max(0, prev.shuttersPerZone.high - 1)
                              }
                            }))}
                          >
                            <Ionicons name="remove" size={12} color="#009999" />
                          </TouchableOpacity>
                          
                          {/* CORRIGÉ : Input compact pour édition directe */}
                          <TextInput
                            style={styles.quantityInput}
                            value={preDefinition.shuttersPerZone.high.toString()}
                            onChangeText={(text) => {
                              const num = parseInt(text) || 0;
                              const clampedNum = Math.max(0, Math.min(30, num));
                              setPreDefinition(prev => ({ 
                                ...prev, 
                                shuttersPerZone: {
                                  ...prev.shuttersPerZone,
                                  high: clampedNum
                                }
                              }));
                            }}
                            keyboardType="numeric"
                            maxLength={2}
                            selectTextOnFocus={true}
                          />
                          
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => setPreDefinition(prev => ({ 
                              ...prev, 
                              shuttersPerZone: {
                                ...prev.shuttersPerZone,
                                high: Math.min(30, prev.shuttersPerZone.high + 1)
                              }
                            }))}
                          >
                            <Ionicons name="add" size={12} color="#009999" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Volets Bas */}
                      <View style={styles.shutterTypeRow}>
                        <View style={styles.shutterTypeLabel}>
                          <View style={[styles.shutterTypeIndicator, { backgroundColor: '#F59E0B' }]} />
                          <Text style={styles.shutterTypeText}>{strings.shutterLow} ({getShutterPrefix('low', currentLanguage)})</Text>
                        </View>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => setPreDefinition(prev => ({ 
                              ...prev, 
                              shuttersPerZone: {
                                ...prev.shuttersPerZone,
                                low: Math.max(0, prev.shuttersPerZone.low - 1)
                              }
                            }))}
                          >
                            <Ionicons name="remove" size={12} color="#009999" />
                          </TouchableOpacity>
                          
                          {/* CORRIGÉ : Input compact pour édition directe */}
                          <TextInput
                            style={styles.quantityInput}
                            value={preDefinition.shuttersPerZone.low.toString()}
                            onChangeText={(text) => {
                              const num = parseInt(text) || 0;
                              const clampedNum = Math.max(0, Math.min(30, num));
                              setPreDefinition(prev => ({ 
                                ...prev, 
                                shuttersPerZone: {
                                  ...prev.shuttersPerZone,
                                  low: clampedNum
                                }
                              }));
                            }}
                            keyboardType="numeric"
                            maxLength={2}
                            selectTextOnFocus={true}
                          />
                          
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={() => setPreDefinition(prev => ({ 
                              ...prev, 
                              shuttersPerZone: {
                                ...prev.shuttersPerZone,
                                low: Math.min(30, prev.shuttersPerZone.low + 1)
                              }
                            }))}
                          >
                            <Ionicons name="add" size={12} color="#009999" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Aperçu du total */}
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryTitle}>📊 {strings.structureOverview}</Text>
                      <View style={styles.summaryStats}>
                        <View style={styles.summaryStat}>
                          <Text style={styles.summaryStatValue}>{totalBuildings}</Text>
                          <Text style={styles.summaryStatLabel}>{strings.buildings}</Text>
                        </View>
                        <View style={styles.summaryStat}>
                          <Text style={styles.summaryStatValue}>{totalZones}</Text>
                          <Text style={styles.summaryStatLabel}>{strings.zones}</Text>
                        </View>
                        <View style={styles.summaryStat}>
                          <Text style={styles.summaryStatValue}>{totalShutters}</Text>
                          <Text style={styles.summaryStatLabel}>{strings.shutters}</Text>
                        </View>
                      </View>
                      <Text style={styles.summaryNote}>
                        {strings.structureComplete} 🚀
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={strings.cancel}
                onPress={() => setCreateModalVisible(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={strings.create}
                onPress={handleSubmitProject}
                disabled={formLoading}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  selectionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  addButton: {
    padding: 6,
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectionCount: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    paddingHorizontal: 32,
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#009999',
    backgroundColor: '#F0FDFA',
  },
  favoriteCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  projectTitleSection: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    minWidth: 0,
  },
  checkbox: {
    padding: 2,
    flexShrink: 0,
  },
  projectName: {
    fontFamily: 'Inter-Bold',
    color: '#111827',
    flex: 1,
    minWidth: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#009999',
  },
  // NOUVEAU : Styles pour l'affichage des dates du projet
  projectDatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectDatesText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
    flexShrink: 0,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  projectContent: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  // NOUVEAU : Conteneur pour l'icône avec hauteur fixe pour l'alignement
  statIconContainer: {
    height: 20, // Hauteur fixe pour aligner toutes les icônes
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  complianceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Styles pour la belle section de conformité
  complianceSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  complianceBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  complianceSegment: {
    height: '100%',
  },
  complianceDetails: {
    gap: 8,
  },
  complianceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complianceDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  // Nouvelle colonne verticale pour les détails
  complianceDetailColumn: {
    gap: 6,
  },
  complianceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  complianceDetailLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  projectFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
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
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  // Styles pour les prédéfinitions
  predefinedSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  predefinedToggle: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitleContainer: {
    flex: 1,
  },
  predefinedTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  predefinedSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  toggleSwitch: {
    marginLeft: 12,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchTrackActive: {
    backgroundColor: '#009999',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  predefinedContent: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // RÉDUIT : 12 → 8
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#009999',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // NOUVEAU : Input compact pour l'édition directe
  quantityInput: {
    width: 50, // COMPACT : Largeur fixe de 50px
    height: 30,
    borderWidth: 1,
    borderColor: '#009999',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#009999',
    paddingHorizontal: 4,
  },
  shutterSection: {
    marginBottom: 20,
  },
  shutterTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  shutterTypeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  shutterTypeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  shutterTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  summaryCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#065F46',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  summaryStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#047857',
    marginTop: 4,
  },
  summaryNote: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#047857',
    textAlign: 'center',
  },
});