import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { useSettingsStore } from '@/stores/settingsStore';
import { THEME_COLORS } from '@/constants';

export default function SettingsScreen() {
  const themeColor = useSettingsStore((s) => s.themeColor);
  const setThemeColor = useSettingsStore((s) => s.setThemeColor);
  const selectedName = THEME_COLORS.find((c) => c.value === themeColor)?.label ?? '';

  return (
    <>
      <Stack.Screen
        options={{
          title: '設定',
          headerBackTitle: '',
          headerTintColor: themeColor,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* 主題顏色 */}
          <Text style={styles.sectionTitle}>主題顏色</Text>
          <View style={styles.colorGrid}>
            {THEME_COLORS.map((color) => {
              const isSelected = themeColor === color.value;
              return (
                <TouchableOpacity
                  key={color.value}
                  style={styles.colorItem}
                  onPress={() => setThemeColor(color.value)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color.value },
                      isSelected && styles.colorCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Text style={styles.checkmark}>
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.colorLabel,
                      isSelected && { color: themeColor, fontWeight: '600' },
                    ]}
                  >
                    {color.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 目前選取提示 */}
          {selectedName ? (
            <View style={[styles.selectedBadge, { backgroundColor: themeColor + '22' }]}>
              <View style={[styles.selectedDot, { backgroundColor: themeColor }]} />
              <Text style={[styles.selectedText, { color: themeColor }]}>
                目前主題：{selectedName}
              </Text>
            </View>
          ) : null}

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#AAAAAA',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  colorItem: {
    width: '20%',
    paddingHorizontal: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  colorCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1.12 }],
  },
  checkmark: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  colorLabel: {
    fontSize: 10,
    color: '#BBBBBB',
    marginTop: 7,
    textAlign: 'center',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
