import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function RecapScreen({ route }) {
  const [soldItems, setSoldItems] = useState([]);

  // Charger les objets vendus depuis AsyncStorage à l'ouverture de la page
  useEffect(() => {
    const loadSoldItems = async () => {
      try {
        const storedSoldItems = await AsyncStorage.getItem('soldItems');
        if (storedSoldItems) {
          setSoldItems(JSON.parse(storedSoldItems));
        }
      } catch (error) {
        console.log('Erreur lors du chargement des objets vendus', error);
      }
    };

    loadSoldItems();
  }, []);

  // Mettre à jour la liste si elle est passée depuis HomeScreen
  useEffect(() => {
    if (route.params?.soldItems) {
      setSoldItems(route.params.soldItems);

      // Sauvegarder la nouvelle liste dans AsyncStorage
      try {
        AsyncStorage.setItem('soldItems', JSON.stringify(route.params.soldItems));
      } catch (error) {
        console.log('Erreur lors de la sauvegarde des objets vendus', error);
      }
    }
  }, [route.params?.soldItems]);

  const totalPriceExpected = soldItems.reduce((sum, item) => sum + item.price, 0);
  const totalPriceSold = soldItems.reduce((sum, item) => sum + (item.soldPrice || item.price), 0);

  // Générer le contenu HTML du PDF
  const generatePdfContent = () => {
    let itemsHtml = soldItems.map(item => {
      return `<p>${item.name} - ${item.soldPrice || item.price}€</p>`;
    }).join('');

    return `
      <h1>Récapitulatif des objets vendus</h1>
      <p>Total attendu : ${totalPriceExpected}€</p>
      <p>Total vendu : ${totalPriceSold}€</p>
      <h2>Détails des objets vendus :</h2>
      ${itemsHtml}
    `;
  };

  // Générer et télécharger le fichier PDF avec expo-print
  const generatePDF = async () => {
    try {
      const htmlContent = generatePdfContent(); // Utilisez votre fonction pour générer le contenu HTML

      // Créer un PDF à partir du contenu HTML
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Partager le fichier PDF généré
      if (uri) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Erreur", "Échec de la création du fichier PDF");
      }
    } catch (error) {
      console.error("Erreur lors de la création du PDF :", error);
      Alert.alert("Erreur", "Impossible de créer le PDF");
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
      <Text>{item.name} - {item.soldPrice || item.price}€</Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <Text>Total attendu : {totalPriceExpected}€</Text>
      <Text>Total vendu : {totalPriceSold}€</Text>

      <FlatList
        data={soldItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />

      {/* Bouton pour générer le PDF */}
      <Button title="Télécharger le PDF" onPress={generatePDF} />
    </View>
  );
}