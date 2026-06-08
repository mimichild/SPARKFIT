import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DBProvider } from '@/providers/DBProvider';

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen name="settings" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </DBProvider>
    </GestureHandlerRootView>
  );
}
