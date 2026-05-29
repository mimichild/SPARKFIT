import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/stores/settingsStore';

export default function AnalysisScreen() {
  const themeColor = useSettingsStore((s) => s.themeColor);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { color: themeColor }]}>分析</Text>
      <Text style={styles.placeholder}>身形分析功能即將推出</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 14,
    color: '#BBBBBB',
  },
});
