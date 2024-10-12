import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from './screens/HomeScreen';
import RecapScreen from './screens/RecapScreen';
import CreateObjectScreen from './screens/CreateObjectScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Objets à vendre" component={HomeScreen} />
          <Tab.Screen name="Créer un objet" component={CreateObjectScreen} />
          <Tab.Screen name="Récapitulatif" component={RecapScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}