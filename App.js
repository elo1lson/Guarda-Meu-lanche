import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import firebase from './firebase.js';


import LoginScreen from './screens/LoginScreen';
import EsqueciaSenha from './screens/EsqueciaSenha';
import FoodPricingScreen from './screens/Home';
import RegisterScreen from './screens/RegisterScreen'; 
import Verificacao from './screens/verificação';
import VendasScreen from './screens/VendasScreen.js';
import NotificationScreen from './screens/Notificacoes';
import UploadImageScreen from './screens/UploadScreen.js';
import PraçasScreen from './screens/PraçasScreen.js'
import CupertinoFooter1 from './components/CupertinoFooter1.js'
import UserScreem  from './screens/UserScreem.js'
import ProdutoScreen from './screens/ProdutoScreen.js';
import CarrinhoScreem from './screens/CarrinhoScreem.js';
import codigoScreem from './screens/codigoScreem.js';
import ConfirmaçaoScreem from './screens/ConfirmaçaoScreem.js'

import { SafeAreaView } from 'react-native-safe-area-context';


const Stack = createStackNavigator();

export default function App() {
  return (
    
    <SafeAreaView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EsqueciaSenha" component={EsqueciaSenha} options={{ headerShown: false }} />
        <Stack.Screen name="Criar Conta" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={FoodPricingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Verificacao" component={Verificacao} options={{ headerShown: false }} />
        <Stack.Screen name="Vendas" component={VendasScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notificacoes" component={NotificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UploadImage" component={UploadImageScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Praças" component={PraçasScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UserScreem" component={UserScreem} options={{ headerShown: false }} />
        <Stack.Screen name="Produto" component={ProdutoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Carrinho" component={CarrinhoScreem} options={{ headerShown: false }} />
        <Stack.Screen name="codigo" component={codigoScreem} options={{ headerShown: false }} />
        <Stack.Screen name="Confirmaçao" component={ConfirmaçaoScreem} options={{ headerShown: false }} />

        <Stack.Screen name="CupertinoFooter1" component={CupertinoFooter1} options={{ headerShown: false}}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
        </SafeAreaView>
  );
}