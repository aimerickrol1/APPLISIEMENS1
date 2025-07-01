import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { Search as SearchIcon, ChevronDown, ChevronRight, Building, Wind, X, Filter, Layers, Target } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { ComplianceIndicator } from '@/components/ComplianceIndicator';
import { SearchResult, Project, Building as BuildingType, FunctionalZone } from '@/types';
import { storage } from '@/utils/storage';
import { calculateCompliance, formatDeviation } from '@/utils/compliance';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';

type SearchMode = 'simple' | 'hierarchical';
type ShutterTypeFilter = 'all' | 'high' | 'low'; // NOUVEAU : Type pour le filtre de volets

interface HierarchicalFilter {
  projectId?: string;
  buildingId?: string;
  zoneId?: string;
  shutterType?: ShutterTypeFilter; // NOUVEAU : Filtre par type de volet
}

export default function SearchScreen() {
  const { strings } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('simple');
  
  // États pour la recherche hiérarchique
  const [projects, setProjects] = useState<Project[]>([]);
  const [hierarchicalFilter, setHierarchicalFilter] = useState<HierarchicalFilter>({});
  const [expandedSections, setExpandedSections] = useState<{
    projects: boolean;
    buildings: boolean;
    zones: boolean;
  }>({
    projects: false,
    buildings: false,
    zones: false
  });

  // Références pour l'animation SEULEMENT
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Charger les projets au montage et quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const loadProjects = async () => {
    try {
      await storage.initialize();
      const projectList = await storage.getProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    }
  };

  useEffect(() => {
    if (searchMode === 'simple' && query.trim().length >= 2) {
      searchShutters();
    } else if (searchMode === 'hierarchical') {
      searchWithHierarchy();
    } else {
      setResults([]);
    }
  }, [query, searchMode, hierarchicalFilter]);

  // Animation des résultats
  useEffect(() => {
    if (results.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [results.length, searchMode, hierarchicalFilter]);

  // FONCTION DE RECHERCHE SIMPLE
  const searchShutters = async () => {
    setLoading(true);
    try {
      console.log('Recherche simple avec la requête:', query.trim());
      const searchResults = await storage.searchShutters(query.trim());
      console.log('Résultats trouvés:', searchResults.length);
      setResults(searchResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchWithHierarchy = async () => {
    setLoading(true);
    try {
      let filteredResults: SearchResult[] = [];
      
      for (const project of projects) {
        // Filtrer par projet si sélectionné
        if (hierarchicalFilter.projectId && project.id !== hierarchicalFilter.projectId) {
          continue;
        }

        for (const building of project.buildings) {
          // Filtrer par bâtiment si sélectionné
          if (hierarchicalFilter.buildingId && building.id !== hierarchicalFilter.buildingId) {
            continue;
          }

          for (const zone of building.functionalZones) {
            // Filtrer par zone si sélectionnée
            if (hierarchicalFilter.zoneId && zone.id !== hierarchicalFilter.zoneId) {
              continue;
            }

            for (const shutter of zone.shutters) {
              // NOUVEAU : Filtrer par type de volet si sélectionné
              if (hierarchicalFilter.shutterType && hierarchicalFilter.shutterType !== 'all') {
                if (shutter.type !== hierarchicalFilter.shutterType) {
                  continue;
                }
              }

              // Si une recherche textuelle est active, filtrer par le texte
              if (query.trim().length >= 2) {
                const queryWords = query.trim().toLowerCase().split(/\s+/).filter(word => word.length > 0);
                const searchableText = [
                  shutter.name,
                  zone.name,
                  building.name,
                  project.name,
                  project.city || '',
                  shutter.remarks || ''
                ].join(' ').toLowerCase();
                
                // Vérifier si tous les mots sont présents
                const matchesSearch = queryWords.every(word => searchableText.includes(word));
                
                if (matchesSearch) {
                  filteredResults.push({ shutter, zone, building, project });
                }
              } else {
                // Sinon, inclure tous les volets qui correspondent aux filtres hiérarchiques
                filteredResults.push({ shutter, zone, building, project });
              }
            }
          }
        }
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Erreur lors de la recherche hiérarchique:', error);
    } finally {
      setLoading(false);
    }
  };

  // SIMPLIFIÉ : Navigation directe vers le volet SANS mémorisation
  const handleShutterPress = (result: SearchResult) => {
    // Navigation simple vers le volet avec le paramètre 'from=search'
    router.push(`/(tabs)/shutter/${result.shutter.id}?from=search`);
  };

  const toggleSearchMode = () => {
    const newMode = searchMode === 'simple' ? 'hierarchical' : 'simple';
    setSearchMode(newMode);
    setQuery('');
    setResults([]);
    setHierarchicalFilter({});
    setExpandedSections({
      projects: false,
      buildings: false,
      zones: false
    });
  };

  const clearHierarchicalFilter = () => {
    setHierarchicalFilter({});
    setExpandedSections({
      projects: false,
      buildings: false,
      zones: false
    });
    setResults([]);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    // Fermer toutes les autres sections quand on en ouvre une
    setExpandedSections(prev => ({
      projects: section === 'projects' ? !prev.projects : false,
      buildings: section === 'buildings' ? !prev.buildings : false,
      zones: section === 'zones' ? !prev.zones : false
    }));
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === hierarchicalFilter.projectId);
  };

  const getSelectedBuilding = () => {
    const project = getSelectedProject();
    return project?.buildings.find(b => b.id === hierarchicalFilter.buildingId);
  };

  const getSelectedZone = () => {
    const building = getSelectedBuilding();
    return building?.functionalZones.find(z => z.id === hierarchicalFilter.zoneId);
  };

  // NOUVEAU : Fonction pour obtenir les statistiques des volets dans la zone sélectionnée
  const getZoneShutterStats = () => {
    const zone = getSelectedZone();
    if (!zone) return { high: 0, low: 0, total: 0 };
    
    const high = zone.shutters.filter(s => s.type === 'high').length;
    const low = zone.shutters.filter(s => s.type === 'low').length;
    const total = zone.shutters.length;
    
    return { high, low, total };
  };

  const renderModeSelector = () => (
    <View style={styles.modeSelectorContainer}>
      <Text style={styles.modeSelectorTitle}>Mode de recherche</Text>
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeOption,
            searchMode === 'simple' && styles.modeOptionActive
          ]}
          onPress={() => searchMode !== 'simple' && toggleSearchMode()}
        >
          <SearchIcon size={16} color={searchMode === 'simple' ? '#ffffff' : '#009999'} />
          <Text style={[
            styles.modeOptionText,
            searchMode === 'simple' && styles.modeOptionTextActive
          ]}>
            {strings.simpleSearch}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeOption,
            searchMode === 'hierarchical' && styles.modeOptionActive
          ]}
          onPress={() => searchMode !== 'hierarchical' && toggleSearchMode()}
        >
          <Layers size={16} color={searchMode === 'hierarchical' ? '#ffffff' : '#009999'} />
          <Text style={[
            styles.modeOptionText,
            searchMode === 'hierarchical' && styles.modeOptionTextActive
          ]}>
            {strings.hierarchicalSearch}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.modeDescription}>
        {searchMode === 'simple' 
          ? 'Recherchez avec un ou plusieurs mots-clés'
          : 'Filtrez d\'abord par projet, bâtiment et zone'
        }
      </Text>
    </View>
  );

  const renderHierarchicalFilters = () => {
    const selectedProject = getSelectedProject();
    const selectedBuilding = getSelectedBuilding();
    const selectedZone = getSelectedZone();
    const shutterStats = getZoneShutterStats(); // NOUVEAU : Statistiques des volets

    return (
      <View style={styles.hierarchicalContainer}>
        <View style={styles.hierarchicalHeader}>
          <Target size={20} color="#009999" />
          <Text style={styles.hierarchicalTitle}>Filtres hiérarchiques</Text>
          {(hierarchicalFilter.projectId || hierarchicalFilter.buildingId || hierarchicalFilter.zoneId || hierarchicalFilter.shutterType) && (
            <TouchableOpacity style={styles.clearAllButton} onPress={clearHierarchicalFilter}>
              <X size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Disposition verticale simple et propre */}
        <View style={styles.filtersContainer}>
          {/* Sélection du projet */}
          <View style={styles.filterSection}>
            <TouchableOpacity
              style={[
                styles.filterHeader,
                selectedProject && styles.filterHeaderSelected
              ]}
              onPress={() => toggleSection('projects')}
            >
              <View style={styles.filterHeaderContent}>
                <Building size={16} color={selectedProject ? "#009999" : "#6B7280"} />
                <Text style={[
                  styles.filterHeaderText,
                  selectedProject && styles.filterHeaderTextSelected
                ]} numberOfLines={1} ellipsizeMode="tail">
                  {selectedProject ? selectedProject.name : 'Sélectionner un projet'}
                </Text>
                {expandedSections.projects ? (
                  <ChevronDown size={16} color="#6B7280" />
                ) : (
                  <ChevronRight size={16} color="#6B7280" />
                )}
              </View>
            </TouchableOpacity>

            {expandedSections.projects && (
              <ScrollView style={styles.filterOptions} nestedScrollEnabled={true}>
                {projects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.filterOption,
                      hierarchicalFilter.projectId === project.id && styles.filterOptionSelected
                    ]}
                    onPress={() => {
                      setHierarchicalFilter({
                        projectId: project.id
                      });
                      setExpandedSections({ projects: false, buildings: false, zones: false });
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      hierarchicalFilter.projectId === project.id && styles.filterOptionTextSelected
                    ]} numberOfLines={1} ellipsizeMode="tail">
                      {project.name}
                    </Text>
                    {project.city && (
                      <Text style={styles.filterOptionSubtext} numberOfLines={1} ellipsizeMode="tail">
                        {project.city}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Sélection du bâtiment */}
          <View style={styles.filterSection}>
            <TouchableOpacity
              style={[
                styles.filterHeader,
                selectedBuilding && styles.filterHeaderSelected,
                !selectedProject && styles.filterHeaderDisabled
              ]}
              onPress={() => selectedProject && toggleSection('buildings')}
              disabled={!selectedProject}
            >
              <View style={styles.filterHeaderContent}>
                <Building size={16} color={selectedBuilding ? "#009999" : "#6B7280"} />
                <Text style={[
                  styles.filterHeaderText,
                  selectedBuilding && styles.filterHeaderTextSelected,
                  !selectedProject && styles.filterHeaderTextDisabled
                ]} numberOfLines={1} ellipsizeMode="tail">
                  {selectedBuilding ? selectedBuilding.name : 'Sélectionner un bâtiment'}
                </Text>
                {selectedProject && (expandedSections.buildings ? (
                  <ChevronDown size={16} color="#6B7280" />
                ) : (
                  <ChevronRight size={16} color="#6B7280" />
                ))}
              </View>
            </TouchableOpacity>

            {expandedSections.buildings && selectedProject && (
              <ScrollView style={styles.filterOptions} nestedScrollEnabled={true}>
                {selectedProject.buildings.map((building) => (
                  <TouchableOpacity
                    key={building.id}
                    style={[
                      styles.filterOption,
                      hierarchicalFilter.buildingId === building.id && styles.filterOptionSelected
                    ]}
                    onPress={() => {
                      setHierarchicalFilter(prev => ({
                        ...prev,
                        buildingId: building.id,
                        zoneId: undefined,
                        shutterType: undefined // NOUVEAU : Reset du filtre de volet
                      }));
                      setExpandedSections({ projects: false, buildings: false, zones: false });
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      hierarchicalFilter.buildingId === building.id && styles.filterOptionTextSelected
                    ]} numberOfLines={1} ellipsizeMode="tail">
                      {building.name}
                    </Text>
                    {building.description && (
                      <Text style={styles.filterOptionSubtext} numberOfLines={1} ellipsizeMode="tail">
                        {building.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Sélection de la zone */}
          <View style={styles.filterSection}>
            <TouchableOpacity
              style={[
                styles.filterHeader,
                selectedZone && styles.filterHeaderSelected,
                !selectedBuilding && styles.filterHeaderDisabled
              ]}
              onPress={() => selectedBuilding && toggleSection('zones')}
              disabled={!selectedBuilding}
            >
              <View style={styles.filterHeaderContent}>
                <Wind size={16} color={selectedZone ? "#009999" : "#6B7280"} />
                <Text style={[
                  styles.filterHeaderText,
                  selectedZone && styles.filterHeaderTextSelected,
                  !selectedBuilding && styles.filterHeaderTextDisabled
                ]} numberOfLines={1} ellipsizeMode="tail">
                  {selectedZone ? selectedZone.name : 'Sélectionner une zone'}
                </Text>
                {selectedBuilding && (expandedSections.zones ? (
                  <ChevronDown size={16} color="#6B7280" />
                ) : (
                  <ChevronRight size={16} color="#6B7280" />
                ))}
              </View>
            </TouchableOpacity>

            {expandedSections.zones && selectedBuilding && (
              <ScrollView style={styles.filterOptions} nestedScrollEnabled={true}>
                {selectedBuilding.functionalZones.map((zone) => (
                  <TouchableOpacity
                    key={zone.id}
                    style={[
                      styles.filterOption,
                      hierarchicalFilter.zoneId === zone.id && styles.filterOptionSelected
                    ]}
                    onPress={() => {
                      setHierarchicalFilter(prev => ({
                        ...prev,
                        zoneId: zone.id,
                        shutterType: 'all' // NOUVEAU : Initialiser le filtre de volet à "tous"
                      }));
                      setExpandedSections({ projects: false, buildings: false, zones: false });
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      hierarchicalFilter.zoneId === zone.id && styles.filterOptionTextSelected
                    ]} numberOfLines={1} ellipsizeMode="tail">
                      {zone.name}
                    </Text>
                    {zone.description && (
                      <Text style={styles.filterOptionSubtext} numberOfLines={1} ellipsizeMode="tail">
                        {zone.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* NOUVEAU : Filtre par type de volet (affiché seulement si une zone est sélectionnée) */}
          {selectedZone && (
            <View style={styles.shutterTypeFilterSection}>
              <Text style={styles.shutterTypeFilterTitle}>🔲 Type de volet</Text>
              <View style={styles.shutterTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.shutterTypeButton,
                    (!hierarchicalFilter.shutterType || hierarchicalFilter.shutterType === 'all') && styles.shutterTypeButtonActive
                  ]}
                  onPress={() => setHierarchicalFilter(prev => ({ ...prev, shutterType: 'all' }))}
                >
                  <Text style={[
                    styles.shutterTypeButtonText,
                    (!hierarchicalFilter.shutterType || hierarchicalFilter.shutterType === 'all') && styles.shutterTypeButtonTextActive
                  ]}>
                    Tous ({shutterStats.total})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.shutterTypeButton,
                    hierarchicalFilter.shutterType === 'high' && styles.shutterTypeButtonActive
                  ]}
                  onPress={() => setHierarchicalFilter(prev => ({ ...prev, shutterType: 'high' }))}
                >
                  <View style={styles.shutterTypeButtonContent}>
                    <View style={[styles.shutterTypeIndicator, { backgroundColor: '#10B981' }]} />
                    <Text style={[
                      styles.shutterTypeButtonText,
                      hierarchicalFilter.shutterType === 'high' && styles.shutterTypeButtonTextActive
                    ]}>
                      VH ({shutterStats.high})
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.shutterTypeButton,
                    hierarchicalFilter.shutterType === 'low' && styles.shutterTypeButtonActive
                  ]}
                  onPress={() => setHierarchicalFilter(prev => ({ ...prev, shutterType: 'low' }))}
                >
                  <View style={styles.shutterTypeButtonContent}>
                    <View style={[styles.shutterTypeIndicator, { backgroundColor: '#F59E0B' }]} />
                    <Text style={[
                      styles.shutterTypeButtonText,
                      hierarchicalFilter.shutterType === 'low' && styles.shutterTypeButtonTextActive
                    ]}>
                      VB ({shutterStats.low})
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
    const compliance = calculateCompliance(item.shutter.referenceFlow, item.shutter.measuredFlow);

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => handleShutterPress(item)}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.shutterName}>{item.shutter.name}</Text>
          <Text style={styles.shutterType}>
            {item.shutter.type === 'high' ? strings.shutterHigh : strings.shutterLow}
          </Text>
        </View>

        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>
            {item.project.name} → {item.building.name} → {item.zone.name}
          </Text>
        </View>

        <View style={styles.flowData}>
          <View style={styles.flowItem}>
            <Text style={styles.flowLabel}>{strings.referenceFlow}</Text>
            <Text style={styles.flowValue}>{item.shutter.referenceFlow.toFixed(0)} {strings.cubicMeterPerHour}</Text>
          </View>
          <View style={styles.flowItem}>
            <Text style={styles.flowLabel}>{strings.measuredFlow}</Text>
            <Text style={styles.flowValue}>{item.shutter.measuredFlow.toFixed(0)} {strings.cubicMeterPerHour}</Text>
          </View>
          <View style={styles.flowItem}>
            <Text style={styles.flowLabel}>{strings.deviation}</Text>
            <Text style={[styles.flowValue, { color: compliance.color }]}>
              {formatDeviation(compliance.deviation)}
            </Text>
          </View>
        </View>

        <View style={styles.resultFooter}>
          <ComplianceIndicator compliance={compliance} size="small" />
          {item.shutter.remarks && (
            <Text style={styles.remarks} numberOfLines={1}>
              {item.shutter.remarks}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getSearchPlaceholder = () => {
    if (searchMode === 'simple') {
      return 'Rechercher un volet...';
    } else {
      return strings.searchInSelected;
    }
  };

  const getEmptyStateText = () => {
    if (searchMode === 'simple') {
      return query.length >= 2 ? strings.noResultsDesc : strings.searchMinChars;
    } else {
      if (!hierarchicalFilter.projectId) {
        return 'Sélectionnez un projet pour commencer la recherche';
      } else if (query.length > 0 && query.length < 2) {
        return strings.searchMinChars;
      } else {
        return strings.noResultsDesc;
      }
    }
  };

  const getScopeDescription = () => {
    if (searchMode === 'simple') return 'Dans tous vos projets';
    
    if (hierarchicalFilter.zoneId) {
      const zone = getSelectedZone();
      let scope = `Dans la zone "${zone?.name}"`;
      
      // NOUVEAU : Ajouter le type de volet dans la description
      if (hierarchicalFilter.shutterType && hierarchicalFilter.shutterType !== 'all') {
        const typeLabel = hierarchicalFilter.shutterType === 'high' ? 'volets hauts' : 'volets bas';
        scope += ` (${typeLabel} uniquement)`;
      }
      
      return scope;
    } else if (hierarchicalFilter.buildingId) {
      const building = getSelectedBuilding();
      return `Dans le bâtiment "${building?.name}"`;
    } else if (hierarchicalFilter.projectId) {
      const project = getSelectedProject();
      return `Dans le projet "${project?.name}"`;
    }
    return 'Sélectionnez un projet';
  };

  return (
    <View style={styles.container}>
      <Header 
        title={strings.searchTitle} 
        subtitle={strings.searchSubtitle}
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Sélecteur de mode */}
        {renderModeSelector()}

        {/* Mode de recherche hiérarchique */}
        {searchMode === 'hierarchical' && renderHierarchicalFilters()}

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Input
            placeholder={getSearchPlaceholder()}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
          
          {/* Indicateur de portée */}
          <View style={styles.scopeIndicator}>
            <Text style={styles.scopeLabel}>{strings.searchScope}:</Text>
            <Text style={styles.scopeValue}>{getScopeDescription()}</Text>
          </View>
        </View>

        {/* Résultats avec animation */}
        {(searchMode === 'simple' && query.length > 0 && query.length < 2) || 
         (searchMode === 'hierarchical' && !hierarchicalFilter.projectId) ? (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {getEmptyStateText()}
            </Text>
          </View>
        ) : (
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{strings.searching}</Text>
              </View>
            ) : results.length === 0 && (
              (searchMode === 'simple' && query.length >= 2) || 
              (searchMode === 'hierarchical' && hierarchicalFilter.projectId)
            ) ? (
              <View style={styles.emptyContainer}>
                <SearchIcon size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>{strings.noResults}</Text>
                <Text style={styles.emptySubtitle}>
                  {getEmptyStateText()}
                </Text>
              </View>
            ) : results.length > 0 ? (
              <Animated.View 
                style={[
                  styles.resultsContainer,
                  { opacity: fadeAnim }
                ]}
              >
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>
                    {results.length} {strings.searchResults}
                  </Text>
                  <View style={styles.resultsBadge}>
                    <Text style={styles.resultsBadgeText}>
                      {results.length}
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={results}
                  renderItem={renderResult}
                  keyExtractor={(item) => item.shutter.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </Animated.View>
            ) : null}
          </>
        )}
      </ScrollView>
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
  
  // Sélecteur de mode amélioré
  modeSelectorContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modeSelectorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  modeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modeOptionActive: {
    backgroundColor: '#009999',
    shadowColor: '#009999',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modeOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#009999',
    textAlign: 'center',
  },
  modeOptionTextActive: {
    color: '#ffffff',
  },
  modeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },

  // Filtres hiérarchiques verticaux SANS z-index problématiques
  hierarchicalContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 16,
  },
  hierarchicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  hierarchicalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  clearAllButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },

  // Conteneur vertical simple et propre
  filtersContainer: {
    gap: 12,
  },
  filterSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  filterHeaderSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#009999',
  },
  filterHeaderDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  filterHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterHeaderText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    flex: 1,
  },
  filterHeaderTextSelected: {
    color: '#009999',
  },
  filterHeaderTextDisabled: {
    color: '#9CA3AF',
  },
  
  // Options avec ScrollView simple et propre
  filterOptions: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    maxHeight: 150,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterOptionSelected: {
    backgroundColor: '#F0FDFA',
    borderLeftWidth: 3,
    borderLeftColor: '#009999',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  filterOptionTextSelected: {
    color: '#009999',
  },
  filterOptionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },

  // NOUVEAU : Styles pour le filtre par type de volet
  shutterTypeFilterSection: {
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  shutterTypeFilterTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#047857',
    marginBottom: 12,
  },
  shutterTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  shutterTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterTypeButtonActive: {
    backgroundColor: '#009999',
    borderColor: '#009999',
  },
  shutterTypeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shutterTypeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  shutterTypeButtonTextActive: {
    color: '#ffffff',
  },
  shutterTypeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Barre de recherche améliorée
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    marginBottom: 8,
  },
  scopeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  scopeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#047857',
  },
  scopeValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#059669',
    flex: 1,
  },

  // États vides et chargement
  hintContainer: {
    padding: 32,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
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
    lineHeight: 22,
  },

  // Résultats améliorés
  resultsContainer: {
    padding: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  resultsBadge: {
    backgroundColor: '#009999',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  resultsBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shutterName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  shutterType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  breadcrumb: {
    marginBottom: 12,
  },
  breadcrumbText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#009999',
  },
  flowData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flowItem: {
    flex: 1,
    alignItems: 'center',
  },
  flowLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  flowValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remarks: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
    flex: 1,
    marginLeft: 12,
  },
});