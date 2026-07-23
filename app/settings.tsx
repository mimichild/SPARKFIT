import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { useSettingsStore } from '@/stores/settingsStore';
import { useBackup } from '@/hooks/useBackup';
import { useProGate } from '@/hooks/useProGate';
import { AdBanner } from '@/components/AdBanner';
import { purchasePro, restorePurchases } from '@/services/purchases';
import { THEME_COLORS } from '@/constants';
import { Colors } from '@/constants/colors';

export default function SettingsScreen() {
  const themeColor = useSettingsStore((s) => s.themeColor);
  const setThemeColor = useSettingsStore((s) => s.setThemeColor);
  const setProUnlocked = useSettingsStore((s) => s.setProUnlocked);
  const selectedName = THEME_COLORS.find((c) => c.value === themeColor)?.label ?? '';
  const { isProUnlocked, requirePro } = useProGate();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const { progress, backupStatus, message, exportBackup, importBackup, isRunning } = useBackup();

  const progressColor = backupStatus === 'error' ? '#FF6B6B' : themeColor;
  const progressBg = backupStatus === 'error' ? '#FFE0E0' : themeColor + '22';

  async function handlePurchase() {
    setPurchasing(true);
    try {
      const isPro = await purchasePro();
      if (isPro) {
        setProUnlocked(true);
        Alert.alert('升級成功', 'Pro 功能已啟用');
      }
    } catch (e) {
      Alert.alert('升級失敗', e instanceof Error ? e.message : '請稍後再試');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    try {
      const isPro = await restorePurchases();
      setProUnlocked(isPro);
      Alert.alert(isPro ? '還原成功' : '沒有找到可還原的購買紀錄', isPro ? 'Pro 功能已啟用' : '若你曾經購買過，請確認使用的是同一個 Apple ID');
    } catch (e) {
      Alert.alert('還原失敗', e instanceof Error ? e.message : '請稍後再試');
    } finally {
      setRestoring(false);
    }
  }

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

          {/* Pro 解鎖 */}
          <Text style={styles.sectionTitle}>PRO 解鎖</Text>
          {Platform.OS === 'android' ? (
            <Text style={styles.proBadge}>✓ Pro 已解鎖（Android 版全功能免費開放）</Text>
          ) : isProUnlocked ? (
            <Text style={styles.proBadge}>✓ Pro 已解鎖</Text>
          ) : (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.hintText}>升級 Pro 即可解鎖分析頁、主題色、匯出匯入，並移除廣告</Text>
              <TouchableOpacity
                style={[styles.exportBtn, { backgroundColor: themeColor, marginTop: 12 }]}
                activeOpacity={0.8}
                onPress={handlePurchase}
                disabled={purchasing}
              >
                <Text style={styles.exportBtnText}>{purchasing ? '處理中…' : '升級 Pro'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRestore} disabled={restoring} activeOpacity={0.7} style={{ alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ color: themeColor, fontSize: 13, fontWeight: '600' }}>{restoring ? '還原中…' : '恢復購買'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 主題顏色 */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>主題顏色</Text>
          <View style={styles.colorGrid}>
            {THEME_COLORS.map((color) => {
              const isSelected = themeColor === color.value;
              return (
                <TouchableOpacity
                  key={color.value}
                  style={styles.colorItem}
                  onPress={() => { if (!requirePro('主題色')) return; setThemeColor(color.value); }}
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
                      <Text style={styles.checkmark}>✓</Text>
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

          {selectedName ? (
            <View style={[styles.selectedBadge, { backgroundColor: themeColor + '22' }]}>
              <View style={[styles.selectedDot, { backgroundColor: themeColor }]} />
              <Text style={[styles.selectedText, { color: themeColor }]}>
                目前主題：{selectedName}
              </Text>
            </View>
          ) : null}

          {/* 備份與還原 */}
          <Text style={[styles.sectionTitle, { marginTop: 36 }]}>備份與還原</Text>

          {/* 進度條 */}
          {backupStatus !== 'idle' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressMessage, { color: progressColor }]}>
                  {message}
                </Text>
                <Text style={[styles.progressPercent, { color: progressColor }]}>
                  {progress}%
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: progressBg }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: progressColor, width: `${progress}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* 匯出備份 */}
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: themeColor }, isRunning && styles.btnDisabled]}
            activeOpacity={0.8}
            onPress={() => { if (!requirePro('匯出備份')) return; exportBackup(); }}
            disabled={isRunning}
          >
            <Text style={styles.exportBtnText}>匯出備份</Text>
          </TouchableOpacity>

          {/* 匯入備份 */}
          <TouchableOpacity
            style={[styles.importBtn, { borderColor: themeColor }, isRunning && styles.btnDisabled]}
            activeOpacity={0.8}
            onPress={() => { if (!requirePro('匯入備份')) return; importBackup(); }}
            disabled={isRunning}
          >
            <Text style={[styles.importBtnText, { color: themeColor }]}>匯入備份</Text>
          </TouchableOpacity>

          {/* 提示文字 */}
          <Text style={styles.hintText}>
            合併：新資料加入現有資料｜覆蓋：清除現有資料後還原
          </Text>

          <View style={{ height: 32 }} />

          <AdBanner />
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
  proBadge: {
    fontSize: 15,
    fontWeight: '600',
    color: '#43a047',
    marginBottom: 12,
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

  // Progress
  progressContainer: {
    marginBottom: 16,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressMessage: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'right',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Buttons
  exportBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  exportBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  importBtn: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  importBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
