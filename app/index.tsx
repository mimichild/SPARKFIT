import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useSettingsStore } from '@/stores/settingsStore';
import { AdBanner } from '@/components/AdBanner';

export default function WelcomeScreen() {
  const router = useRouter();
  const themeColor = useSettingsStore(s => s.themeColor);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColor }]}>
      <StatusBar style="light" />

      {/* Centre — title + subtitle */}
      <View style={styles.center}>
        <Text style={styles.title}>SPARK SCALE</Text>
        <Text style={styles.subtitle}>記錄所有的數據，我要見證我的蛻變</Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Settings button */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsBtnText}>設定</Text>
        </TouchableOpacity>

        {/* CTA button */}
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: '#FFFFFF' }]}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={[styles.startBtnText, { color: themeColor }]}>開始使用</Text>
        </TouchableOpacity>
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Title area — sits at ~45 % from top
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 6,
    marginBottom: 10,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#EAEAEA',
    letterSpacing: 0.5,
    lineHeight: 20,
    textAlign: 'center',
  },

  // Bottom
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 20,
  },
  settingsBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  settingsBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  startBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
