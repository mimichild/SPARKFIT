import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/stores/settingsStore';
import { useIsPro } from '@/hooks/useIsPro';
import { AdBanner } from '@/components/AdBanner';

const TAB_BAR_BASE_HEIGHT = 56;
const TAB_BAR_BASE_PADDING = 6;

export default function TabLayout() {
  const themeColor = useSettingsStore((s) => s.themeColor);
  const isPro = useIsPro();
  const insets = useSafeAreaInsets();
  // 有廣告時分頁列下方接的是 AdBanner，不用留安全區；沒有廣告（Android 全部、iOS Pro）
  // 時分頁列才是螢幕真正的底部，要補回安全區高度。
  const bottomInset = isPro ? insets.bottom : 0;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        backBehavior="none"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: themeColor,
          tabBarInactiveTintColor: '#BBBBBB',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
            height: TAB_BAR_BASE_HEIGHT + bottomInset,
            paddingBottom: TAB_BAR_BASE_PADDING + bottomInset,
            paddingTop: TAB_BAR_BASE_PADDING,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '數據',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: '報告',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="analytics-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analysis"
          options={{
            title: '分析',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <AdBanner />
    </View>
  );
}
