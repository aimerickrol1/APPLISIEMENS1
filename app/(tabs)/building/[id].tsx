import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Plus, Wind, Settings, Star, Trash2, SquareCheck as CheckSquare, Square, X } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Project, Building, FunctionalZone } from '@/types';
import { storage } from '@/utils/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCallback } from 'react';

export default function BuildingDetailScreen() {
  const { strings } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [building, setBuilding] = useState<Building | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // États pour le mode sélection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [favoriteZones, setFavoriteZones] = useState<Set<string>>(new Set());

  // Modal pour éditer le nom de la zone
  const [nameEditModal, setNameEditModal] = useState<{
    visible: boolean;
    zone: FunctionalZone | null;
    name: string;
  }>({ visible: false, zone: null, name: '' });

  // Référence pour l'auto-focus
  const nameInputRef = useRef<TextInput>(null);

  // Auto-focus sur l'input du nom quand le modal s'ouvre
  useEffect(() => {
    if (nameEditModal.visible && nameInputRef.current) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [nameEditModal.visible]);

  const loadBuilding = useCallback(async () => {
    try {
      const projects = await storage.getProjects();
      for (const proj of projects) {
        const foundBuilding = proj.buildings.find(b => b.id === id);
        if (foundBuilding) {
          setBuilding(foundBuilding);
          setProject(proj);
          break;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du bâtiment:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await storage.getFavoriteZones();
      setFavoriteZones(new Set(favorites));
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  }, []);

  // NOUVEAU : Utiliser useFocusEffect pour recharger les données quand on revient sur la page
  useFocusEffect(
    useCallback(() => {
      console.log('Building screen focused, reloading data...');
      loadBuilding();
      loadFavorites();
    }, [loadBuilding, loadFavorites])
  );

  useEffect(() => {
    loadBuilding();
    loadFavorites();
  }, [loadBuilding, loadFavorites]);

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

  const handleEditBuilding = () => {
    try {
      router.push(`/(tabs)/building/edit/${id}`);
    } catch (error) {
      console.error('Erreur de navigation vers édition:', error);
    }
  };

  const handleCreateZone = () => {
    try {
      router.push(`/(tabs)/zone/create?buildingId=${id}`);
    } catch (error) {
      console.error('Erreur de navigation vers création zone:', error);
    }
  };

  const handleZonePress = (zone: FunctionalZone) => {
    // Si on est en mode sélection, sélectionner/désélectionner
    if (selectionMode) {
      handleZoneSelection(zone.id);
      return;
    }

    router.push(`/(tabs)/zone/${zone.id}`);
  };

  // Fonction pour éditer une zone
  const handleEditZone = (zone: FunctionalZone) => {
    try {
      router.push(`/(tabs)/zone/edit/${zone.id}`);
    } catch (error) {
      console.error('Erreur de navigation vers édition zone:', error);
    }
  };

  // Fonction pour ouvrir le modal d'édition du nom
  const openNameEditModal = (zone: FunctionalZone) => {
    setNameEditModal({
      visible: true,
      zone,
      name: zone.name
    });
  };

  // Fonction pour sauvegarder le changement de nom
  const saveNameChange = async () => {
    if (!nameEditModal.zone || !nameEditModal.name.trim()) return;

    try {
      await storage.updateFunctionalZone(nameEditModal.zone.id, {
        name: nameEditModal.name.trim(),
      });
      
      setNameEditModal({ visible: false, zone: null, name: '' });
      loadBuilding();
    } catch (error) {
      Alert.alert(strings.error, 'Impossible de modifier le nom de la zone');
    }
  };

  // Fonctions pour le mode sélection
  const handleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedZones(new Set());
  };

  const handleZoneSelection = (zoneId: string) => {
    const newSelection = new Set(selectedZones);
    if (newSelection.has(zoneId)) {
      newSelection.delete(zoneId);
    } else {
      newSelection.add(zoneId);
    }
    setSelectedZones(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedZones.size === 0) return;

    Alert.alert(
      strings.delete + ' ' + strings.zones.toLowerCase(),
      `Êtes-vous sûr de vouloir supprimer ${selectedZones.size} zone${selectedZones.size > 1 ? 's' : ''} ?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.delete,
          style: 'destructive',
          onPress: async () => {
            for (const zoneId of selectedZones) {
              await storage.deleteFunctionalZone(zoneId);
            }
            setSelectedZones(new Set());
            setSelectionMode(false);
            loadBuilding();
          }
        }
      ]
    );
  };

  const handleBulkFavorite = async () => {
    if (selectedZones.size === 0) return;

    const newFavorites = new Set(favoriteZones);
    for (const zoneId of selectedZones) {
      if (newFavorites.has(zoneId)) {
        newFavorites.delete(zoneId);
      } else {
        newFavorites.add(zoneId);
      }
    }
    
    setFavoriteZones(newFavorites);
    await storage.setFavoriteZones(Array.from(newFavorites));
    setSelectedZones(new Set());
    setSelectionMode(false);
  };

  const handleToggleFavorite = async (zoneId: string) => {
    const newFavorites = new Set(favoriteZones);
    if (newFavorites.has(zoneId)) {
      newFavorites.delete(zoneId);
    } else {
      newFavorites.add(zoneId);
    }
    
    setFavoriteZones(newFavorites);
    await storage.setFavoriteZones(Array.from(newFavorites));
  };

  const handleDeleteZone = async (zone: FunctionalZone) => {
    Alert.alert(
      strings.deleteZone,
      `Êtes-vous sûr de vouloir supprimer la zone "${zone.name}" ?`,
      [
        { text: strings.cancel, style: 'cancel' },
        {
          text: strings.delete,
          style: 'destructive',
          onPress: async () => {
            await storage.deleteFunctionalZone(zone.id);
            loadBuilding();
          }
        }
      ]
    );
  };

  // Fonction pour obtenir le détail des volets par type
  const getShutterDetails = (zone: FunctionalZone) => {
    const highShutters = zone.shutters.filter(s => s.type === 'high').length;
    const lowShutters = zone.shutters.filter(s => s.type === 'low').length;
    const total = zone.shutters.length;
    
    return { highShutters, lowShutters, total };
  };

  // Trier les zones : favoris en premier
  const sortedZones = building ? [...building.functionalZones].sort((a, b) => {
    const aIsFavorite = favoriteZones.has(a.id);
    const bIsFavorite = favoriteZones.has(b.id);
    
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  }) : [];

  const renderZone = ({ item }: { item: FunctionalZone }) => {
    const shutterDetails = getShutterDetails(item);
    const isSelected = selectedZones.has(item.id);
    const isFavorite = favoriteZones.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.zoneCard,
          isSelected && styles.selectedCard,
          isFavorite && styles.favoriteCard
        ]}
        onPress={() => handleZonePress(item)}
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            handleZoneSelection(item.id);
          }
        }}
      >
        {/* PREMIÈRE LIGNE COMPACTE : Icône + Nom + Nombre de volets */}
        <View style={styles.zoneFirstRow}>
          <View style={styles.zoneNameSection}>
            {selectionMode && (
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => handleZoneSelection(item.id)}
              >
                {isSelected ? (
                  <CheckSquare size={16} color="#009999" />
                ) : (
                  <Square size={16} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            )}
            <Wind size={16} color="#009999" />
            {/* Nom de la zone cliquable pour édition directe */}
            <TouchableOpacity 
              style={[styles.zoneNameContainer, selectionMode && styles.zoneNameContainerSelection]}
              onPress={() => !selectionMode && openNameEditModal(item)}
              disabled={selectionMode}
            >
              <Text style={styles.zoneName} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
              </Text>
              {!selectionMode && <Text style={styles.editIcon}>✏️</Text>}
            </TouchableOpacity>
          </View>
          
          {/* Case du nombre total de volets - COMPACTE */}
          <View style={styles.shutterCountContainer}>
            <Text style={styles.shutterCountTotal}>
              {shutterDetails.total} {strings.shutters.toLowerCase()}
            </Text>
          </View>
        </View>

        {/* DEUXIÈME LIGNE : Description (si elle existe) */}
        {item.description && (
          <View style={styles.descriptionRow}>
            <Text style={styles.zoneDescription} numberOfLines={1} ellipsizeMode="tail">
              {item.description}
            </Text>
          </View>
        )}

        {/* TROISIÈME LIGNE COMPACTE : Détail VH/VB + Actions (SANS le pourcentage) */}
        <View style={styles.zoneBottomRow}>
          {/* Détail des volets par type - COMPACT */}
          <View style={styles.shutterDetailsCompact}>
            {shutterDetails.highShutters > 0 && (
              <View style={styles.shutterTypeCompact}>
                <View style={[styles.shutterDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.shutterTypeText}>{shutterDetails.highShutters} VH</Text>
              </View>
            )}
            {shutterDetails.lowShutters > 0 && (
              <View style={styles.shutterTypeCompact}>
                <View style={[styles.shutterDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.shutterTypeText}>{shutterDetails.lowShutters} VB</Text>
              </View>
            )}
          </View>

          {/* Actions - COMPACTES (maintenant à droite sans le pourcentage) */}
          {!selectionMode && (
            <View style={styles.actionButtonsCompact}>
              <TouchableOpacity 
                style={styles.actionButtonCompact}
                onPress={() => handleToggleFavorite(item.id)}
              >
                <Star 
                  size={12} 
                  color={isFavorite ? "#F59E0B" : "#9CA3AF"} 
                  fill={isFavorite ? "#F59E0B" : "none"}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButtonCompact}
                onPress={() => handleEditZone(item)}
              >
                <Settings size={12} color="#009999" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButtonCompact}
                onPress={() => handleDeleteZone(item)}
              >
                <Trash2 size={12} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SUPPRIMÉ : La barre de progression de conformité */}
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

  // Afficher la ville si elle existe, sinon afficher le nom du projet
  const locationInfo = project.city ? `${project.name} • ${project.city}` : project.name;

  return (
    <View style={styles.container}>
      <Header
        title={building.name}
        subtitle={locationInfo}
        onBack={handleBack}
        rightComponent={
          <View style={styles.headerContainer}>
            {/* Première ligne avec les boutons principaux */}
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleEditBuilding} style={styles.actionButton}>
                <Settings size={20} color="#009999" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateZone} style={styles.actionButton}>
                <Plus size={24} color="#009999" />
              </TouchableOpacity>
            </View>
            
            {/* Deuxième ligne avec le bouton sélection */}
            <View style={styles.selectionRow}>
              <TouchableOpacity onPress={handleSelectionMode} style={styles.selectionButton}>
                <Text style={styles.selectionButtonText}>
                  {selectionMode ? strings.cancel : 'Sélect.'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* Barre d'outils de sélection */}
      {selectionMode && (
        <View style={styles.selectionToolbar}>
          <Text style={styles.selectionCount}>
            {selectedZones.size} {strings.selected}{selectedZones.size > 1 ? 's' : ''}
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleBulkFavorite}
              disabled={selectedZones.size === 0}
            >
              <Star size={20} color={selectedZones.size > 0 ? "#F59E0B" : "#9CA3AF"} />
              <Text style={[styles.toolbarButtonText, { color: selectedZones.size > 0 ? "#F59E0B" : "#9CA3AF" }]}>
                {strings.favorites}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.toolbarButton}
              onPress={handleBulkDelete}
              disabled={selectedZones.size === 0}
            >
              <Trash2 size={20} color={selectedZones.size > 0 ? "#EF4444" : "#9CA3AF"} />
              <Text style={[styles.toolbarButtonText, { color: selectedZones.size > 0 ? "#EF4444" : "#9CA3AF" }]}>
                {strings.delete}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {building.functionalZones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Wind size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{strings.noZones}</Text>
            <Text style={styles.emptySubtitle}>
              {strings.noZonesDesc}
            </Text>
            <Button
              title={strings.createZone}
              onPress={handleCreateZone}
              style={styles.createButton}
            />
          </View>
        ) : (
          <FlatList
            data={sortedZones}
            renderItem={renderZone}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal pour éditer le nom de la zone avec auto-focus */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={nameEditModal.visible}
        onRequestClose={() => setNameEditModal({ visible: false, zone: null, name: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.nameEditModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le nom de la zone</Text>
              <TouchableOpacity 
                onPress={() => setNameEditModal({ visible: false, zone: null, name: '' })}
                style={styles.closeButton}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>{strings.zoneName} *</Text>
              <TextInput
                ref={nameInputRef}
                style={styles.nameTextInput}
                value={nameEditModal.name}
                onChangeText={(text) => setNameEditModal(prev => ({ ...prev, name: text }))}
                placeholder="Ex: ZF01, Zone Hall"
                placeholderTextColor="#9CA3AF"
                autoFocus={true}
                selectTextOnFocus={true}
              />
            </View>

            <View style={styles.modalFooter}>
              <Button
                title={strings.cancel}
                onPress={() => setNameEditModal({ visible: false, zone: null, name: '' })}
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
  // Styles pour le conteneur d'en-tête à deux niveaux
  headerContainer: {
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  selectionRow: {
    flexDirection: 'row',
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
    padding: 8,
  },
  // Styles pour la barre d'outils de sélection
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
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    paddingHorizontal: 32,
  },
  listContainer: {
    padding: 16,
  },

  // STYLES COMPACTS ET RAFFINÉS pour les cartes de zone
  zoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  // Styles pour les cartes sélectionnées et favorites
  selectedCard: {
    borderWidth: 1,
    borderColor: '#009999',
    backgroundColor: '#F0FDFA',
  },
  favoriteCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },

  // PREMIÈRE LIGNE COMPACTE : Icône + Nom + Nombre de volets
  zoneFirstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  zoneNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  checkbox: {
    padding: 1,
    flexShrink: 0,
  },
  // Conteneur pour le nom de la zone cliquable - COMPACT
  zoneNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
    minWidth: 0,
  },
  zoneNameContainerSelection: {
    backgroundColor: 'transparent',
  },
  zoneName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
    minWidth: 0,
  },
  editIcon: {
    fontSize: 10,
  },
  // Case du nombre total de volets - COMPACTE
  shutterCountContainer: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: 70,
  },
  shutterCountTotal: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#009999',
    textAlign: 'center',
  },

  // DEUXIÈME LIGNE : Description (optionnelle) - COMPACTE
  descriptionRow: {
    marginBottom: 6,
  },
  zoneDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    paddingLeft: 22, // Aligné avec le nom (icône + gap)
  },

  // TROISIÈME LIGNE COMPACTE : Détail VH/VB + Actions (SANS pourcentage)
  zoneBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Détail des volets par type - TRÈS COMPACT
  shutterDetailsCompact: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  shutterTypeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  shutterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  shutterTypeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },

  // Actions - TRÈS COMPACTES (maintenant directement à droite)
  actionButtonsCompact: {
    flexDirection: 'row',
    gap: 2,
  },
  actionButtonCompact: {
    padding: 3,
    borderRadius: 3,
    backgroundColor: '#F9FAFB',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
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