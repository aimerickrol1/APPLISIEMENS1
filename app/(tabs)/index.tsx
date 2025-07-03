import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Plus, Minus, Trash2, Building2, Layers, Edit3 } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { DateInput } from '@/components/DateInput';
import { NumericInput } from '@/components/NumericInput';
import { Project } from '@/types';
import { storage } from '@/utils/storage';
import { calculateCompliance } from '@/utils/compliance';
import { useLanguage } from '@/contexts/LanguageContext';

// INTERFACES POUR LA NOUVELLE PRÉDÉFINITION AVEC NOMS DE VOLETS
interface PredefinedShutter {
  id: string;
  name: string;
  type: 'high' | 'low';
}

interface PredefinedZone {
  id: string;
  name: string;
  shutters: PredefinedShutter[];
}

interface PredefinedBuilding {
  id: string;
  name: string;
  zones: PredefinedZone[];
}

interface StructurePredefinition {
  enabled: boolean;
  buildings: PredefinedBuilding[];
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

  // NOUVELLE PRÉDÉFINITION DE STRUCTURE AVEC VOLETS NOMMÉS
  const [structurePredefinition, setStructurePredefinition] = useState<StructurePredefinition>({
    enabled: false,
    buildings: []
  });

  // Fonction pour obtenir le préfixe selon la langue
  const getShutterPrefix = (shutterType: 'high' | 'low', language: string) => {
    const prefixes = {
      fr: { high: 'VH', low: 'VB' },
      en: { high: 'HS', low: 'LS' },
      es: { high: 'CA', low: 'CB' },
      it: { high: 'SA', low: 'SB' },
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
    setStructurePredefinition({
      enabled: false,
      buildings: []
    });
  };

  const handleCreateProject = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  // FONCTIONS DE GESTION DE LA PRÉDÉFINITION

  const togglePredefinition = () => {
    setStructurePredefinition(prev => ({
      ...prev,
      enabled: !prev.enabled,
      buildings: !prev.enabled ? [createDefaultBuilding()] : []
    }));
  };

  const createDefaultBuilding = (): PredefinedBuilding => ({
    id: Date.now().toString(),
    name: `${strings.building} A`,
    zones: [createDefaultZone()]
  });

  const createDefaultZone = (): PredefinedZone => ({
    id: Date.now().toString(),
    name: 'ZF01',
    shutters: [
      createDefaultShutter('high', 1),
      createDefaultShutter('low', 1)
    ]
  });

  const createDefaultShutter = (type: 'high' | 'low', index: number): PredefinedShutter => {
    const prefix = getShutterPrefix(type, currentLanguage);
    return {
      id: `${Date.now()}_${type}_${index}`,
      name: `${prefix}${index.toString().padStart(2, '0')}`,
      type
    };
  };

  const addBuilding = () => {
    const buildingLetter = String.fromCharCode(65 + structurePredefinition.buildings.length); // A, B, C...
    const newBuilding: PredefinedBuilding = {
      id: Date.now().toString(),
      name: `${strings.building} ${buildingLetter}`,
      zones: [createDefaultZone()]
    };

    setStructurePredefinition(prev => ({
      ...prev,
      buildings: [...prev.buildings, newBuilding]
    }));
  };

  const removeBuilding = (buildingId: string) => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.filter(b => b.id !== buildingId)
    }));
  };

  const updateBuildingName = (buildingId: string, name: string) => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId ? { ...b, name } : b
      )
    }));
  };

  const addZone = (buildingId: string) => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => {
        if (b.id === buildingId) {
          const zoneNumber = b.zones.length + 1;
          const newZone: PredefinedZone = {
            id: Date.now().toString(),
            name: `ZF${zoneNumber.toString().padStart(2, '0')}`,
            shutters: [
              createDefaultShutter('high', 1),
              createDefaultShutter('low', 1)
            ]
          };
          return { ...b, zones: [...b.zones, newZone] };
        }
        return b;
      })
    }));
  };

  const removeZone = (buildingId: string, zoneId: string) => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
          ? { ...b, zones: b.zones.filter(z => z.id !== zoneId) }
          : b
      )
    }));
  };

  const updateZoneName = (buildingId: string, zoneId: string, name: string) => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
          ? { 
              ...b, 
              zones: b.zones.map(z => 
                z.id === zoneId ? { ...z, name } : z
              )
            }
          : b
      )
    }));
  };

  // NOUVELLES FONCTIONS POUR GÉRER LES VOLETS INDIVIDUELLEMENT
  const addShutter = (buildingId: string, zoneId: string, type: 'high' | 'low') => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
          ? { 
              ...b, 
              zones: b.zones.map(z => {
                if (z.id === zoneId) {
                  const shuttersOfType = z.shutters.filter(s => s.type === type);
                  const nextIndex = shuttersOfType.length + 1;
                  const newShutter = createDefaultShutter(type, nextIndex);
                  return { ...z, shutters: [...z.shutters, newShutter] };
                }
                return z;
              })
            }
          : b
      )
    }));
  };

  const removeShutter = (buildingId: string, zoneId: string, shutterId: string) => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
          ? { 
              ...b, 
              zones: b.zones.map(z => 
                z.id === zoneId 
                  ? { ...z, shutters: z.shutters.filter(s => s.id !== shutterId) }
                  : z
              )
            }
          : b
      )
    }));
  };

  const updateShutterName = (buildingId: string, zoneId: string, shutterId: string, name: string) => {
    setStructurePredefinition(prev => ({
      ...prev,
      buildings: prev.buildings.map(b => 
        b.id === buildingId 
          ? { 
              ...b, 
              zones: b.zones.map(z => 
                z.id === zoneId 
                  ? { 
                      ...z, 
                      shutters: z.shutters.map(s => 
                        s.id === shutterId ? { ...s, name } : s
                      )
                    }
                  : z
              )
            }
          : b
      )
    }));
  };

  // CRÉATION DE LA STRUCTURE PRÉDÉFINIE
  const createPredefinedStructure = async (projectId: string) => {
    try {
      for (const buildingDef of structurePredefinition.buildings) {
        const building = await storage.createBuilding(projectId, {
          name: buildingDef.name,
          description: undefined,
        });

        if (building) {
          for (const zoneDef of buildingDef.zones) {
            const zone = await storage.createFunctionalZone(building.id, {
              name: zoneDef.name,
              description: undefined,
            });

            if (zone) {
              // Créer chaque volet avec son nom personnalisé
              for (const shutterDef of zoneDef.shutters) {
                await storage.createShutter(zone.id, {
                  name: shutterDef.name,
                  type: shutterDef.type,
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

  // Calcul des totaux pour l'aperçu
  const getTotals = () => {
    const totalBuildings = structurePredefinition.buildings.length;
    const totalZones = structurePredefinition.buildings.reduce((sum, b) => sum + b.zones.length, 0);
    const totalShutters = structurePredefinition.buildings.reduce((sum, b) => 
      sum + b.zones.reduce((zoneSum, z) => zoneSum + z.shutters.length, 0), 0
    );
    return { totalBuildings, totalZones, totalShutters };
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

      // Créer la structure prédéfinie si activée
      if (structurePredefinition.enabled && structurePredefinition.buildings.length > 0) {
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

  const sortedProjects = [...projects].sort((a, b) => {
    const aIsFavorite = favoriteProjects.has(a.id);
    const bIsFavorite = favoriteProjects.has(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

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
                <View style={styles.complianceDetailRow}>
                  <Text style={styles.complianceDetailText}>
                    {stats.shutterCount} {strings.shutters.toLowerCase()}
                  </Text>
                </View>
                
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

  const totals = getTotals();

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

      {/* MODAL AVEC PRÉDÉFINITION ET NOMS DE VOLETS PERSONNALISABLES */}
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
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
            >
              {/* Champs de base du projet */}
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

              {/* NOUVELLE SECTION PRÉDÉFINITION AVEC NOMS DE VOLETS */}
              <View style={styles.predefinitionSection}>
                <TouchableOpacity 
                  style={styles.predefinitionToggle}
                  onPress={togglePredefinition}
                >
                  <View style={styles.toggleHeader}>
                    <View style={styles.toggleTitleContainer}>
                      <Text style={styles.predefinitionTitle}>
                        🏗️ {strings.predefineStructure} ({strings.optional})
                      </Text>
                      <Text style={styles.predefinitionSubtitle}>
                        Créer automatiquement bâtiments, zones et volets avec noms personnalisables
                      </Text>
                    </View>
                    <View style={styles.toggleSwitch}>
                      <View style={[styles.switchTrack, structurePredefinition.enabled && styles.switchTrackActive]}>
                        <View style={[styles.switchThumb, structurePredefinition.enabled && styles.switchThumbActive]} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {structurePredefinition.enabled && (
                  <View style={styles.predefinitionContent}>
                    {/* Aperçu des totaux */}
                    {totals.totalBuildings > 0 && (
                      <View style={styles.totalsCard}>
                        <Text style={styles.totalsTitle}>📊 Aperçu de la structure</Text>
                        <View style={styles.totalsRow}>
                          <View style={styles.totalItem}>
                            <Text style={styles.totalValue}>{totals.totalBuildings}</Text>
                            <Text style={styles.totalLabel}>{strings.buildings}</Text>
                          </View>
                          <View style={styles.totalItem}>
                            <Text style={styles.totalValue}>{totals.totalZones}</Text>
                            <Text style={styles.totalLabel}>{strings.zones}</Text>
                          </View>
                          <View style={styles.totalItem}>
                            <Text style={styles.totalValue}>{totals.totalShutters}</Text>
                            <Text style={styles.totalLabel}>{strings.shutters}</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Liste des bâtiments */}
                    {structurePredefinition.buildings.map((building, buildingIndex) => (
                      <View key={building.id} style={styles.buildingCard}>
                        <View style={styles.buildingHeader}>
                          <Building2 size={16} color="#009999" />
                          <TextInput
                            style={styles.buildingNameInput}
                            value={building.name}
                            onChangeText={(text) => updateBuildingName(building.id, text)}
                            placeholder="Nom du bâtiment"
                          />
                          <TouchableOpacity
                            onPress={() => removeBuilding(building.id)}
                            style={styles.removeButton}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        {/* Liste des zones du bâtiment */}
                        {building.zones.map((zone, zoneIndex) => (
                          <View key={zone.id} style={styles.zoneCard}>
                            <View style={styles.zoneHeader}>
                              <Layers size={14} color="#6B7280" />
                              <TextInput
                                style={styles.zoneNameInput}
                                value={zone.name}
                                onChangeText={(text) => updateZoneName(building.id, zone.id, text)}
                                placeholder="Nom de la zone"
                              />
                              <TouchableOpacity
                                onPress={() => removeZone(building.id, zone.id)}
                                style={styles.removeZoneButton}
                              >
                                <Trash2 size={12} color="#EF4444" />
                              </TouchableOpacity>
                            </View>

                            {/* NOUVELLE SECTION : Liste des volets avec noms personnalisables */}
                            <View style={styles.shuttersSection}>
                              <Text style={styles.shuttersSectionTitle}>🔲 Volets de la zone</Text>
                              
                              {/* Volets hauts */}
                              <View style={styles.shutterTypeSection}>
                                <View style={styles.shutterTypeHeader}>
                                  <View style={styles.shutterTypeIndicator}>
                                    <View style={[styles.shutterTypeDot, { backgroundColor: '#10B981' }]} />
                                    <Text style={styles.shutterTypeLabel}>Volets Hauts ({getShutterPrefix('high', currentLanguage)})</Text>
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => addShutter(building.id, zone.id, 'high')}
                                    style={styles.addShutterButton}
                                  >
                                    <Plus size={12} color="#10B981" />
                                  </TouchableOpacity>
                                </View>
                                
                                {zone.shutters.filter(s => s.type === 'high').map((shutter) => (
                                  <View key={shutter.id} style={styles.shutterItem}>
                                    <TextInput
                                      style={styles.shutterNameInput}
                                      value={shutter.name}
                                      onChangeText={(text) => updateShutterName(building.id, zone.id, shutter.id, text)}
                                      placeholder={`${getShutterPrefix('high', currentLanguage)}01`}
                                    />
                                    <TouchableOpacity
                                      onPress={() => removeShutter(building.id, zone.id, shutter.id)}
                                      style={styles.removeShutterButton}
                                    >
                                      <Trash2 size={10} color="#EF4444" />
                                    </TouchableOpacity>
                                  </View>
                                ))}
                              </View>

                              {/* Volets bas */}
                              <View style={styles.shutterTypeSection}>
                                <View style={styles.shutterTypeHeader}>
                                  <View style={styles.shutterTypeIndicator}>
                                    <View style={[styles.shutterTypeDot, { backgroundColor: '#F59E0B' }]} />
                                    <Text style={styles.shutterTypeLabel}>Volets Bas ({getShutterPrefix('low', currentLanguage)})</Text>
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => addShutter(building.id, zone.id, 'low')}
                                    style={styles.addShutterButton}
                                  >
                                    <Plus size={12} color="#F59E0B" />
                                  </TouchableOpacity>
                                </View>
                                
                                {zone.shutters.filter(s => s.type === 'low').map((shutter) => (
                                  <View key={shutter.id} style={styles.shutterItem}>
                                    <TextInput
                                      style={styles.shutterNameInput}
                                      value={shutter.name}
                                      onChangeText={(text) => updateShutterName(building.id, zone.id, shutter.id, text)}
                                      placeholder={`${getShutterPrefix('low', currentLanguage)}01`}
                                    />
                                    <TouchableOpacity
                                      onPress={() => removeShutter(building.id, zone.id, shutter.id)}
                                      style={styles.removeShutterButton}
                                    >
                                      <Trash2 size={10} color="#EF4444" />
                                    </TouchableOpacity>
                                  </View>
                                ))}
                              </View>
                            </View>
                          </View>
                        ))}

                        {/* Bouton ajouter zone */}
                        <TouchableOpacity
                          onPress={() => addZone(building.id)}
                          style={styles.addZoneButton}
                        >
                          <Plus size={14} color="#009999" />
                          <Text style={styles.addZoneText}>Ajouter une zone</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Bouton ajouter bâtiment */}
                    <TouchableOpacity
                      onPress={addBuilding}
                      style={styles.addBuildingButton}
                    >
                      <Plus size={16} color="#009999" />
                      <Text style={styles.addBuildingText}>Ajouter un bâtiment</Text>
                    </TouchableOpacity>
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
  statIconContainer: {
    height: 20,
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

  // STYLES POUR LA NOUVELLE PRÉDÉFINITION AVEC NOMS DE VOLETS
  predefinitionSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  predefinitionToggle: {
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
  predefinitionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  predefinitionSubtitle: {
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
  predefinitionContent: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  totalsCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  totalsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#065F46',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#10B981',
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#047857',
    marginTop: 2,
  },
  buildingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  buildingNameInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
  },
  removeButton: {
    padding: 4,
  },
  zoneCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  zoneNameInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 2,
  },
  removeZoneButton: {
    padding: 2,
  },
  
  // NOUVEAUX STYLES POUR LES VOLETS PERSONNALISABLES
  shuttersSection: {
    marginTop: 8,
  },
  shuttersSectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  shutterTypeSection: {
    marginBottom: 12,
  },
  shutterTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shutterTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shutterTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shutterTypeLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  addShutterButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
  },
  shutterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  shutterNameInput: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#ffffff',
  },
  removeShutterButton: {
    padding: 2,
  },
  
  addZoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#009999',
    borderStyle: 'dashed',
  },
  addZoneText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#009999',
  },
  addBuildingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#009999',
  },
  addBuildingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});