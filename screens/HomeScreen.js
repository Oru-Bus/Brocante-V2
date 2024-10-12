import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, TextInput, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ route, navigation }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [soldPrice, setSoldPrice] = useState('');

  // Charger les objets depuis le stockage local
  useEffect(() => {
    const loadItems = async () => {
      try {
        const storedItems = await AsyncStorage.getItem('items');
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }
      } catch (error) {
        console.log('Erreur lors du chargement des objets', error);
      }
    };
    loadItems();
  }, []);

  // Sauvegarder les objets à chaque modification
  useEffect(() => {
    const saveItems = async () => {
      try {
        await AsyncStorage.setItem('items', JSON.stringify(items));
      } catch (error) {
        console.log('Erreur lors de la sauvegarde des objets', error);
      }
    };
    saveItems();
  }, [items]);


  // Ouvre la modal pour entrer le prix de vente
  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Fermer la modal et enregistrer le prix de vente
  const handleSellItem = () => {
    if (soldPrice) {
      const updatedItems = items.map(item =>
        item.id === selectedItem.id ? { ...item, sold: true, soldPrice: parseFloat(soldPrice) } : item
      );
      setItems(updatedItems);
      setSoldPrice('');
      setModalVisible(false);

      // Naviguer vers la page de récapitulatif
      navigation.navigate("Récapitulatif", { soldItems: updatedItems.filter(item => item.sold) });
    }
  };

  // Supprimer un objet de la liste
  const handleDeleteItem = (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
  };

  // Réinitialiser l'application
  const resetApp = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      // Reset the state
      setItems([]);
      // Naviguer vers Récapitulatif et y réinitialiser aussi
      navigation.navigate("Récapitulatif", { soldItems: [] });
    } catch (error) {
      console.log('Erreur lors de la réinitialisation de l\'application', error);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.sold
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name} - {item.price}€</Text>
      <View style={styles.buttonContainer}>
        <Button title="Vendu" onPress={() => openModal(item)} />
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
          <Image
            source={require('../Images/poubelle.png')} // Chemin vers ton icône de suppression
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Rechercher un objet"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />

        {/* Bouton pour réinitialiser l'application */}
        <TouchableOpacity onPress={resetApp} style={styles.resetButton}>
          <Image
            source={require('../Images/reset.png')} // Chemin vers ton icône de réinitialisation
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      
      {/* Liste des objets filtrés */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />

      {/* Modal pour entrer le prix de vente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>Prix de vente pour {selectedItem?.name}</Text>
            <TextInput
              placeholder="Prix de vente"
              value={soldPrice}
              onChangeText={setSoldPrice}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button title="Annuler" onPress={() => setModalVisible(false)} />
              <Button title="OK" onPress={handleSellItem} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1, // Prend tout l'espace disponible
    borderWidth: 1,
    marginRight: 10,
    padding: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center'
  },
  itemText: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10
  },
  icon: {
    width: 30,  // Taille de l'icône
    height: 30
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10
  },
  modalInput: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 5
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});