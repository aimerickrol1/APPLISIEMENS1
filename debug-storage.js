// Script de débogage à exécuter dans la console du navigateur
// ou à ajouter temporairement dans votre app

import AsyncStorage from '@react-native-async-storage/async-storage';

// Fonction pour voir tout ce qui est stocké
const debugStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('Toutes les clés de stockage:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}:`, JSON.parse(value || '{}'));
    }
  } catch (error) {
    console.error('Erreur debug storage:', error);
  }
};

// Fonction pour tout nettoyer
const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Stockage nettoyé');
    // Rechargez la page après
    window.location.reload();
  } catch (error) {
    console.error('Erreur nettoyage:', error);
  }
};

// Exécutez ces fonctions
debugStorage();
// clearAllStorage(); // Décommentez pour nettoyer