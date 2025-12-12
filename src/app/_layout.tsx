import "react-native-gesture-handler";
import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { WalletProvider } from "../context/wallet-context";
import { useFonts } from "expo-font";
import { NetworkProvider } from "../context/network-context";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
      "ProzaDisplay-Regular": require("../../assets/fonts/ProzaDisplay-Regular.ttf"),
      "ProzaDisplay-SemiBold": require("../../assets/fonts/ProzaDisplay-SemiBold.ttf"),
      "ProzaDisplay-SemiBoldItalic": require("../../assets/fonts/ProzaDisplay-SemiBoldItalic.ttf"),
      "ProzaDisplay-Bold": require("../../assets/fonts/ProzaDisplay-Bold.ttf"),
  });

  // Wait for custom fonts before rendering screens to avoid fallback fonts flashing on index
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <WalletProvider>
            <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
              <Tabs.Screen name="index" options={{ href: null, title: "Kodu" }} />
              <Tabs.Screen name="coin-flipper" options={{ href: null, title: "Viska Münti" }}/>
              <Tabs.Screen name="filter" options={{ href: null, title: "Filtreeri" }}/>
              <Tabs.Screen name="wallet" options={{ href: null, title: "Rahakott" }}/>
            </Tabs>
          </WalletProvider>
        </NetworkProvider>
      </SafeAreaProvider>
      <Toast/>
    </GestureHandlerRootView>
  );
}
