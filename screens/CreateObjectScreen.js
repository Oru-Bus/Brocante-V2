import React, { useState, useEffect  } from 'react';
import { View, TextInput, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateObjectScreen({ navigation }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [items, setItems] = useState([]);

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

  const addItem = () => {
    if (itemName && itemPrice) {
      const newItem = {
        id: Date.now(),
        name: itemName,
        price: parseFloat(itemPrice),
        sold: false
      };

      setItems([...items, newItem]);

      // Réinitialiser les champs après ajout
      setItemName('');
      setItemPrice('');
    }
  };


  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Nom de l'objet"
        value={itemName}
        onChangeText={setItemName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <TextInput
        placeholder="Prix"
        value={itemPrice}
        onChangeText={setItemPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      <Button title="Ajouter un objet" onPress={addItem} />
    </View>
  );
}