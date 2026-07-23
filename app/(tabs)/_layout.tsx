import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/stores/settingsStore';
import { AdBanner } from '@/components/AdBanner';

export default function TabLayout() {
  const themeColor = useSettingsStore((s) => s.themeColor);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        backBehavior="none"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: themeColor,
          tabBarInactiveTintColor: '#BBBBBB',
          // 分頁列下方接了 AdBanner，不是螢幕最底部，所以不用再加安全區留白。
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F0F0F0',
            height: 56,
            paddingBottom: 6,
            paddingTop: 6,
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
