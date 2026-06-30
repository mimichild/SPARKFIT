import { useCallback, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useDBContext } from '@/providers/DBProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import { STORAGE_KEYS } from '@/constants';

export type BackupStatus = 'idle' | 'exporting' | 'importing' | 'done' | 'error';

export function useBackup() {
  const db = useDBContext();
  const setHeight = useSettingsStore(s => s.setHeight);
  const setShoulderWidth = useSettingsStore(s => s.setShoulderWidth);
  const setTargetWeight = useSettingsStore(s => s.setTargetWeight);
  const setThemeColor = useSettingsStore(s => s.setThemeColor);

  const [progress, setProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>('idle');
  const [message, setMessage] = useState('');

  const reset = useCallback(() => {
    setBackupStatus('idle');
    setProgress(0);
    setMessage('');
  }, []);

  const doImport = useCallback(async (fileUri: string, mode: 'merge' | 'overwrite') => {
    try {
      setBackupStatus('importing');
      setProgress(0);
      setMessage('讀取檔案中...');

      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      setProgress(20);

      const backup = JSON.parse(content);
      if (!Array.isArray(backup?.measurements)) throw new Error('invalid format');
      setProgress(30);

      if (mode === 'overwrite') {
        setMessage('清除現有資料...');
        await db.runAsync('DELETE FROM measurements');
      }
      setProgress(40);

      const total = backup.measurements.length;
      for (let i = 0; i < total; i++) {
        const m = backup.measurements[i];
        await db.runAsync(
          `INSERT OR REPLACE INTO measurements
            (date, weight, chest, waist, low_waist, hip, thigh, arm,
             bmi, bmr, body_fat_rate, body_fat_weight, muscle_weight, bone_weight,
             visceral_fat, body_age, waist_hip_ratio, obesity_degree, recommended_calories)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.date, m.weight ?? null, m.chest ?? null, m.waist ?? null,
            m.low_waist ?? null, m.hip ?? null, m.thigh ?? null, m.arm ?? null,
            m.bmi ?? null, m.bmr ?? null, m.body_fat_rate ?? null, m.body_fat_weight ?? null,
            m.muscle_weight ?? null, m.bone_weight ?? null, m.visceral_fat ?? null,
            m.body_age ?? null, m.waist_hip_ratio ?? null, m.obesity_degree ?? null,
            m.recommended_calories ?? null,
          ],
        );
        setProgress(40 + Math.round(((i + 1) / Math.max(total, 1)) * 55));
        setMessage(`匯入中... (${i + 1} / ${total})`);
      }

      if (backup.settings) {
        const s = backup.settings;
        if (s.height !== undefined) setHeight(s.height);
        if (s.shoulderWidth !== undefined) setShoulderWidth(s.shoulderWidth);
        if (s.targetWeight !== undefined) setTargetWeight(s.targetWeight);
        if (s.themeColor !== undefined) setThemeColor(s.themeColor);
      }

      setProgress(100);
      setMessage('匯入完成');
      setBackupStatus('done');
      Alert.alert('匯入成功', `已成功匯入 ${total} 筆資料`, [
        { text: '確定', onPress: reset },
      ]);
    } catch {
      setBackupStatus('error');
      setMessage('匯入失敗');
      Alert.alert('匯入失敗', '請確認檔案格式是否正確', [
        { text: '確定', onPress: reset },
      ]);
    }
  }, [db, setHeight, setShoulderWidth, setTargetWeight, setThemeColor, reset]);

  const importBackup = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const fileUri = result.assets[0].uri;

      Alert.alert(
        '選擇匯入方式',
        '合併：新資料加入現有資料\n覆蓋：清除現有資料後還原',
        [
          { text: '取消', style: 'cancel' },
          { text: '合併', onPress: () => doImport(fileUri, 'merge') },
          { text: '覆蓋', style: 'destructive', onPress: () => doImport(fileUri, 'overwrite') },
        ],
      );
    } catch {
      // picker cancelled or error
    }
  }, [doImport]);

  const exportBackup = useCallback(async () => {
    try {
      setBackupStatus('exporting');
      setProgress(0);
      setMessage('讀取資料中...');

      const measurements = await db.getAllAsync('SELECT * FROM measurements ORDER BY date ASC');
      setProgress(30);

      const settingsRaw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const s = settingsRaw ? (JSON.parse(settingsRaw)?.state ?? {}) : {};
      setProgress(50);

      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        measurements,
        settings: {
          height: s.height ?? null,
          shoulderWidth: s.shoulderWidth ?? null,
          targetWeight: s.targetWeight ?? null,
          themeColor: s.themeColor ?? '#EAAFB3',
        },
      };
      const json = JSON.stringify(backup, null, 2);
      setProgress(65);

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `sparkfit-backup-${dateStr}.json`;

      if (Platform.OS === 'android') {
        setMessage('請選擇儲存位置...');
        const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perm.granted) {
          setBackupStatus('idle');
          setProgress(0);
          setMessage('');
          return;
        }
        setProgress(75);
        setMessage('儲存中...');

        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          perm.directoryUri,
          filename,
          'application/json',
        );
        await FileSystem.writeAsStringAsync(fileUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        setProgress(100);
        setMessage('匯出完成');
        setBackupStatus('done');
        Alert.alert('匯出成功', `檔案已儲存至您選擇的資料夾\n\n檔案名稱：${filename}`, [
          { text: '確定', onPress: reset },
        ]);
      } else {
        setMessage('準備匯出...');
        const cacheUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(cacheUri, json, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        setProgress(90);
        await Sharing.shareAsync(cacheUri, {
          mimeType: 'application/json',
          dialogTitle: '儲存備份檔案',
          UTI: 'public.json',
        });
        setProgress(100);
        setMessage('匯出完成');
        setBackupStatus('done');
        Alert.alert('匯出成功', `備份檔案：${filename}`, [
          { text: '確定', onPress: reset },
        ]);
      }
    } catch {
      setBackupStatus('error');
      setMessage('匯出失敗');
      Alert.alert('匯出失敗', '請再試一次', [
        { text: '確定', onPress: reset },
      ]);
    }
  }, [db, reset]);

  return {
    progress,
    backupStatus,
    message,
    exportBackup,
    importBackup,
    isRunning: backupStatus === 'exporting' || backupStatus === 'importing',
  };
}
