import { Alert, Linking } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useSettingsStore } from '@/stores/settingsStore';
import { AdBanner } from '@/components/AdBanner';

const APP_DOWNLOAD_URLS: Record<string, string> = {
  sparkplate: 'https://drive.google.com/file/d/1_sbu3LG46hKvYkWJjPbFPii0_V4b4dJd/view?usp=drive_link',
};

async function openApp(scheme: string) {
  try {
    const url = `${scheme}://`;
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (!canOpen) {
      const downloadUrl = APP_DOWNLOAD_URLS[scheme];
      if (downloadUrl) {
        Alert.alert(
          '尚未安裝',
          '找不到此應用程式，是否前往下載？',
          [
            { text: '取消', style: 'cancel' },
            { text: '前往下載', onPress: () => Linking.openURL(downloadUrl) },
          ],
        );
      } else {
        Alert.alert('找不到 App', '請確認手機已安裝此應用程式。');
      }
      return;
    }
    await Linking.openURL(url);
  } catch {
    const downloadUrl = APP_DOWNLOAD_URLS[scheme];
    if (downloadUrl) {
      Linking.openURL(downloadUrl);
    } else {
      Alert.alert('找不到 App', '請確認手機已安裝此應用程式。');
    }
  }
}

export default function WelcomeScreen() {
  const router = useRouter();
  const themeColor = useSettingsStore(s => s.themeColor);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Centre — title + subtitle */}
      <View style={styles.center}>
        <Text style={[styles.title, { color: themeColor }]}>SPARK FIT</Text>
        <Text style={styles.subtitle}>記錄所有的數據，我要見證我的蛻變</Text>
      </View>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Settings link */}
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/settings')}
          activeOpacity={0.6}
        >
          <Ionicons name="settings-outline" size={13} color="#BBBBBB" />
          <Text style={styles.settingsText}>設定</Text>
        </TouchableOpacity>

        {/* Sister apps */}
        <View style={styles.appsRow}>
          <TouchableOpacity
            onPress={() => openApp('sparkshape')}
            activeOpacity={0.6}
          >
            <Text style={[styles.appLink, { color: themeColor }]}>SPARK SHAPE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openApp('sparkplate')}
            activeOpacity={0.6}
          >
            <Text style={[styles.appLink, { color: themeColor }]}>SPARK PLATE</Text>
          </TouchableOpacity>
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: themeColor }]}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>開始使用</Text>
        </TouchableOpacity>
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  subtitle: {
    fontSize: 13,
    color: '#AAAAAA',
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
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  settingsText: {
    fontSize: 12,
    color: '#BBBBBB',
    letterSpacing: 1,
  },
  appsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
  },
  appLink: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textDecorationLine: 'underline',
    opacity: 0.55,
  },
  startBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
