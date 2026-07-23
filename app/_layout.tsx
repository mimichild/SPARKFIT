import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import { DBProvider } from '@/providers/DBProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import { fetchProStatus } from '@/services/purchases';

mobileAds().initialize();

function ProStatusSync() {
  const setProUnlocked = useSettingsStore((s) => s.setProUnlocked);
  useEffect(() => {
    // RevenueCat 尚未設定（沒有 API Key）時回傳 null，維持本機既有的 Pro 狀態，不要用 null 蓋掉。
    fetchProStatus().then(isPro => {
      if (isPro != null) setProUnlocked(isPro);
    });
  }, []);
  return null;
}

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProStatusSync />
      <DBProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              // Limit the swipe-back recognition area to a thin strip at the
              // left edge (like iOS's native edge-swipe) so it doesn't compete
              // with vertical ScrollView gestures across the rest of the screen.
              gestureResponseDistance: { start: 35 },
            }}
          />
          <Stack.Screen name="add-data" options={{ headerShown: false }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </DBProvider>
    </GestureHandlerRootView>
  );
}
