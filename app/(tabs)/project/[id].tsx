import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Plus, Settings, Building, Wind, Star, Trash2, SquareCheck as CheckSquare, Square } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Project, Building as BuildingType, FunctionalZone } from '@/types';
import { storage } from '@/utils/storage';
import { calculateCompliance, formatDeviation } from '@/utils/compliance';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProjectDetailScreen() {
  const { strings } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [createBuildingModalVisible, setCreateBuildingModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState<Set<string>>(new Set());
  const [favoriteBuildings, setFavoriteBuildings] = useState<Set<string>>(new Set());
  
  // Form states
  const [buildingName, setBuildingName] = useState('');
  const [buildingDescription, setBuildingDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // NOUVEAU : Modal pour éditer le nom du bâtiment
  const [nameEditModal, setNameEditModal] = useState<{
    visible: boolean;
    building: BuildingType | null;
    name: string;
  }>({ visible: false, building: null, name: '' });

  // NOUVEAU : Référence pour l'auto-focus
  const nameInputRef = useRef<TextInput>(null);

  // NOUVEAU : Auto-focus sur l'input du nom quand le modal s'ouvre
  useEffect(() => {
    if (nameEditModal.visible && nameInputRef.current) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [nameEditModal.visible]);

  const loadProject = useCallback(async () => {
    try {
      const projects = await storage.getProjects();
      const foundProject = projects.find(p => p.id === id);
      setProject(foundProject || null);
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await storage.getFavoriteBuildings();
      setFavoriteBuildings(new Set(favorites));
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  }, []);

  // NOUVEAU : Utiliser useFocusEffect pour recharger les données quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      console.log('Project screen focused, reloading data...');
      loadProject();
      loadFavorites();
    }, [loadProject, loadFavorites])
  );

  useEffect(() => {
    loadProject();
    loadFavorites();
  }, [loadProject, loadFavorites]);

  const handleBack = () => {
    try {
      // CORRIGÉ : Retourner vers la liste des projets
      router.push('/(tabs)/');
    } catch (error) {
      console.error('Erreur de navigation:', error);
      // Fallback vers l'accueil
      router.push('/(tabs)/');
    }
  };

  const resetForm = () => {
    setBuildingName('');
    setBuildingDescription('');
    setErrors({});
  };

  const handleCreateBuilding = () => {
    resetForm();
    setCreateBuildingModalVisible(true);
  };

  const handleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedBuildings(new Set());
  };

  const handleBuildingSelection = (buildingId: string) => {
    const newSelection = new Set(selectedBuildings);
    if (newSelection.has(buildingId)) {
      newSelection.delete(buildingId);
    } else {
      newSelection.add(buildingId);
    }
    setSelectedBuildings(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedBuildings.size === 0) return;

    Alert.alert(
      strings.delete + ' ' + strings.buildings.toLowerCase(),
      `Êtes-vous sûr de vouloir supprimer ${selectedBuildings.size} bâtiment${selectedBuildings.size > 1 ? 's' : ''} ?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.delete,
          style: 'destructive',
          onPress: async () => {
            for (const buildingId of selectedBuildings) {
              await storage.deleteBuilding(buildingId);
            }
            setSelectedBuildings(new Set());
            setSelectionMode(false);
            loadProject();
          }
        }
      ]
    );
  };

  const handleBulkFavorite = async () => {
    if (selectedBuildings.size === 0) return;

    const newFavorites = new Set(favoriteBuildings);
    for (const buildingId of selectedBuildings) {
      if (newFavorites.has(buildingId)) {
        newFavorites.delete(buildingId);
      } else {
        newFavorites.add(buildingId);
      }
    }
    
    setFavoriteBuildings(newFavorites);
    await storage.setFavoriteBuildings(Array.from(newFavorites));
    setSelectedBuildings(new Set());
    setSelectionMode(false);
  };

  const handleToggleFavorite = async (buildingId: string) => {
    const newFavorites = new Set(favoriteBuildings);
    if (newFavorites.has(buildingId)) {
      newFavorites.delete(buildingId);
    } else {
      newFavorites.add(buildingId);
    }
    
    setFavoriteBuildings(newFavorites);
    await storage.setFavoriteBuildings(Array.from(newFavorites));
  };

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!buildingName.trim()) {
      newErrors.name = strings.nameRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBuilding = async () => {
    if (!validateForm() || !project) return;

    setFormLoading(true);
    try {
      const building = await storage.createBuilding(project.id, {
        name: buildingName.trim(),
        description: buildingDescription.trim() || undefined,
      });

      if (building) {
        setCreateBuildingModalVisible(false);
        resetForm();
        loadProject();
        
        // Navigation directe vers le bâtiment créé
        router.push(`/(tabs)/building/${building.id}`);
      } else {
        Alert.alert(strings.error, 'Impossible de créer le bâtiment.');
      }
    } catch (error) {
      Alert.alert(strings.error, 'Impossible de créer le bâtiment. Veuillez réessayer.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleBuildingPress = (building: BuildingType) => {
    if (selectionMode) {
      handleBuildingSelection(building.id);
    } else {
      router.push(`/(tabs)/building/${building.id}`);
    }
  };

  // NOUVEAU : Fonction pour ouvrir le modal d'édition du nom
  const openNameEditModal = (building: BuildingType) => {
    setNameEditModal({
      visible: true,
      building,
      name: building.name
    });
  };

  // NOUVEAU : Fonction pour sauvegarder le changement de nom
  const saveNameChange = async () => {
    if (!nameEditModal.building || !nameEditModal.name.trim()) return;

    try {
      await storage.updateBuilding(nameEditModal.building.id, {
        name: nameEditModal.name.trim(),
      });
      
      setNameEditModal({ visible: false, building: null, name: '' });
      loadProject();
    } catch (error) {
      Alert.alert(strings.error, 'Impossible de modifier le nom du bâtiment');
    }
  };

  const handleEditBuilding = (building: BuildingType) => {
    try {
      router.push(`/(tabs)/building/edit/${building.id}`);
    } catch (error) {
      console.error('Erreur de navigation vers édition bâtiment:', error);
    }
  };

  const handleDeleteBuilding = async (building: BuildingType) => {
    Alert.alert(
      strings.deleteBuilding,
      `Êtes-vous sûr de vouloir supprimer le bâtiment "${building.name}" ?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.delete,
          style: 'destructive',
          onPress: async () => {
            await storage.deleteBuilding(building.id);
            loadProject();
          }
        }
      ]
    );
  };

  const handleEditProject = () => {
    try {
      router.push(`/(tabs)/project/edit/${id}`);
    } catch (error) {
      console.error('Erreur de navigation:', error);
      Alert.alert(strings.error, 'Impossible d\'ouvrir la page de modification.');
    }
  };

  const getBuildingStats = (building: BuildingType) => {
    const zoneCount = building.functionalZones.length;
    const shutterCount = building.functionalZones.reduce((total, zone) => total + zone.shutters.length, 0);
    
    let compliantCount = 0;
    let acceptableCount = 0;
    let nonCompliantCount = 0;

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

    const complianceRate = shutterCount > 0 ? (compliantCount / shutterCount) * 100 : 0;

    return {
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
    const baseSize = 18;
    const minSize = 15;
    const maxLength = hasActions ? 25 : 35;
    
    if (text.length <= maxLength) {
      return baseSize;
    } else if (text.length <= maxLength + 8) {
      return 16;
    } else {
      return minSize;
    }
  };

  // Trier les bâtiments : favoris en premier
  const sortedBuildings = project ? [...project.buildings].sort((a, b) => {
    const aIsFavorite = favoriteBuildings.has(a.id);
    const bIsFavorite = favoriteBuildings.has(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  }) : [];

  const renderBuilding = ({ item }: { item: BuildingType }) => {
    const stats = getBuildingStats(item);
    const isSelected = selectedBuildings.has(item.id);
    const isFavorite = favoriteBuildings.has(item.id);
    const hasActions = !selectionMode;
    const adaptiveFontSize = getAdaptiveFontSize(item.name, hasActions);

    return (
      <TouchableOpacity
        style={[
          styles.buildingCard,
          isSelected && styles.selectedCard,
          isFavorite && styles.favoriteCard
        ]}
        onPress={() => handleBuildingPress(item)}
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            handleBuildingSelection(item.id);
          }
        }}
      >
        <View style={styles.buildingHeader}>
          <View style={styles.buildingTitleSection}>
            <View style={styles.titleRow}>
              {selectionMode && (
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => handleBuildingSelection(item.id)}
                >
                  {isSelected ? (
                    <CheckSquare size={20} color="#009999" />
                  ) : (
                    <Square size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              )}
              <Building size={20} color="#009999" />
              {/* NOUVEAU : Nom du bâtiment cliquable pour édition directe */}
              <TouchableOpacity 
                style={[styles.buildingNameContainer, selectionMode && styles.buildingNameContainerSelection]}
                onPress={() => !selectionMode && openNameEditModal(item)}
                disabled={selectionMode}
              >
                <Text 
                  style={[styles.buildingName, { fontSize: adaptiveFontSize }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
                {!selectionMode && <Text style={styles.editIcon}>✏️</Text>}
              </TouchableOpacity>
            </View>
            {item.description && (
              <Text style={styles.buildingDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          
          {!selectionMode && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleToggleFavorite(item.id)}
              >
                <Star 
                  size={14} 
                  color={isFavorite ? "#F59E0B" : "#9CA3AF"} 
                  fill={isFavorite ? "#F59E0B" : "none"}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditBuilding(item)}
              >
                <Settings size={14} color="#009999" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteBuilding(item)}
              >
                <Trash2 size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buildingContent}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Wind size={16} color="#009999" />
              <Text style={styles.statText}>{stats.zoneCount} {strings.zones.toLowerCase()}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.complianceIndicator, { 
                backgroundColor: stats.complianceRate >= 80 ? '#10B981' : stats.complianceRate >= 60 ? '#F59E0B' : '#EF4444' 
              }]} />
              <Text style={styles.statText}>{stats.shutterCount} {strings.shutters.toLowerCase()}</Text>
            </View>

            {stats.shutterCount > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.complianceRate, { 
                  color: stats.complianceRate >= 80 ? '#10B981' : stats.complianceRate >= 60 ? '#F59E0B' : '#EF4444' 
                }]}>
                  {stats.complianceRate.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>

          {stats.shutterCount > 0 && (
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
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
    <View style={styles.container}>
      <Header
        title={project.name}
        subtitle={project.city}
        onBack={handleBack}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSelectionMode} style={styles.selectionButton}>
              <Text style={styles.selectionButtonText}>
                {selectionMode ? strings.cancel : 'Sélect.'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEditProject} style={styles.actionButton}>
              <Settings size={18} color="#009999" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateBuilding} style={styles.actionButton}>
              <Plus size={22} color="#009999" />
            </TouchableOpacity>
          </View>
        }
      />

      {selectionMode && (
        <View style={styles.selectionToolbar}>
          <Text style={styles.selectionCount}>
            {selectedBuildings.size} {strings.selected}{selectedBuildings.size > 1 ? 's' : ''}
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleBulkFavorite}
              disabled={selectedBuildings.size === 0}
            >
              <Star size={20} color={selectedBuildings.size > 0 ? "#F59E0B" : "#9CA3AF"} />
              <Text style={[styles.toolbarButtonText, { color: selectedBuildings.size > 0 ? "#F59E0B" : "#9CA3AF" }]}>
                {strings.favorites}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleBulkDelete}
              disabled={selectedBuildings.size === 0}
            >
              <Trash2 size={20} color={selectedBuildings.size > 0 ? "#EF4444" : "#9CA3AF"} />
              <Text style={[styles.toolbarButtonText, { color: selectedBuildings.size > 0 ? "#EF4444" : "#9CA3AF" }]}>
                {strings.delete}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {project.buildings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Building size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{strings.noBuildings}</Text>
            <Text style={styles.emptySubtitle}>
              {strings.noBuildingsDesc}
            </Text>
            <Button
              title={strings.createBuilding}
              onPress={handleCreateBuilding}
              style={styles.createButton}
            />
          </View>
        ) : (
          <FlatList
            data={sortedBuildings}
            renderItem={renderBuilding}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal de création de bâtiment */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createBuildingModalVisible}
        onRequestClose={() => setCreateBuildingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{strings.newBuilding}</Text>
              <TouchableOpacity 
                onPress={() => setCreateBuildingModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Input
                label={strings.buildingName + " *"}
                value={buildingName}
                onChangeText={setBuildingName}
                placeholder="Ex: Bâtiment A, Tour Nord"
                error={errors.name}
              />

              <Input
                label={strings.description + " (" + strings.optional + ")"}
                value={buildingDescription}
                onChangeText={setBuildingDescription}
                placeholder="Ex: Bâtiment principal, 5 étages"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={strings.cancel}
                onPress={() => setCreateBuildingModalVisible(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={strings.create}
                onPress={handleSubmitBuilding}
                disabled={formLoading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* NOUVEAU : Modal pour éditer le nom du bâtiment avec auto-focus */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={nameEditModal.visible}
        onRequestClose={() => setNameEditModal({ visible: false, building: null, name: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.nameEditModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le nom du bâtiment</Text>
              <TouchableOpacity 
                onPress={() => setNameEditModal({ visible: false, building: null, name: '' })}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{strings.buildingName} *</Text>
              <TextInput
                ref={nameInputRef}
                style={styles.nameTextInput}
                value={nameEditModal.name}
                onChangeText={(text) => setNameEditModal(prev => ({ ...prev, name: text }))}
                placeholder="Ex: Bâtiment A, Tour Nord"
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
                selectTextOnFocus={true}
              />
            </View>

            <View style={styles.modalFooter}>
              <Button
                title={strings.cancel}
                onPress={() => setNameEditModal({ visible: false, building: null, name: '' })}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={strings.save}
                onPress={saveNameChange}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  actionButton: {
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
  buildingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  buildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  buildingTitleSection: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    minWidth: 0,
  },
  checkbox: {
    padding: 2,
    flexShrink: 0,
  },
  // NOUVEAU : Conteneur pour le nom du bâtiment cliquable
  buildingNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    minWidth: 0,
  },
  buildingNameContainerSelection: {
    backgroundColor: 'transparent',
  },
  buildingName: {
    fontFamily: 'Inter-Bold',
    color: '#111827',
    flex: 1,
    minWidth: 0,
  },
  editIcon: {
    fontSize: 12,
  },
  buildingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 2,
    flexShrink: 0,
  },
  buildingContent: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  complianceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  complianceRate: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  complianceBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  complianceSegment: {
    height: '100%',
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
    maxWidth: 400,
    maxHeight: '70%',
  },
  // NOUVEAU : Modal spécifique pour l'édition du nom
  nameEditModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
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
    maxHeight: 300,
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
  // NOUVEAU : Styles pour l'input avec auto-focus
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 6,
  },
  nameTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
});