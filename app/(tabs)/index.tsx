import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { useSettingsStore } from '@/stores/settingsStore';
import { getContrastColor } from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const themeColor = useSettingsStore((s) => s.themeColor);
  const textOnTheme = getContrastColor(themeColor);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* ── 中央標題區 ── */}
      <View style={styles.centerSection}>
        <Text style={[styles.title, { color: themeColor }]}>SPARK FIT</Text>
        <Text style={styles.subtitle}>紀錄身材數值，見證自己的每一次蛻變</Text>
      </View>

      {/* ── 底部操作區 ── */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.settingsButton}
          activeOpacity={0.6}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsText}>✳ 設定</Text>
        </TouchableOpacity>

        <View style={styles.linksRow}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => Linking.openURL('sparkplate://')}
          >
            <Text style={styles.linkText}>SPARK PLATE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => Linking.openURL('sparkshape://')}
          >
            <Text style={styles.linkText}>SPARK SHAPE</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: themeColor }]}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>開始使用</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  settingsButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingsText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
  },
  linkText: {
    fontSize: 12,
    color: '#BBBBBB',
    letterSpacing: 1,
    fontWeight: '500',
  },
  startButton: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});
