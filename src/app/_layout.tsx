import "react-native-gesture-handler";
import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { WalletProvider } from "../context/wallet-context";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <WalletProvider>
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
          <Tabs.Screen name="index" options={{ href: null, title: "Kodu" }} />
          <Tabs.Screen name="coin-flipper" options={{ href: null, title: "Viska Münti" }}/>
          <Tabs.Screen name="wallet" options={{ href: null, title: "Rahakott" }}/>
        </Tabs>
        </WalletProvider>
      </SafeAreaProvider>
      <Toast/>
    </GestureHandlerRootView>
  );
}

