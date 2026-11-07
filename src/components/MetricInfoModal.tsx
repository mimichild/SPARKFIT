import { useRef } from 'react';
import { Modal, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  info: { title: string; description: string } | null;
  onClose: () => void;
  themeColor: string;
};

/** 首頁數據名稱旁 (?) 點開的說明視窗。 */
export function MetricInfoModal({ info, onClose, themeColor }: Props) {
  // 關閉時 info 立刻變 null，但淡出動畫還在跑；記住最後一筆內容，避免閃出空白卡片
  const lastInfo = useRef(info);
  if (info) lastInfo.current = info;
  const shown = info ?? lastInfo.current;

  return (
    <Modal visible={info != null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* 點卡片本身不關閉 */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{shown?.title}</Text>
          <Text style={styles.description}>{shown?.description}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: themeColor }]}
            testID="metric-info-close"
          >
            <Text style={styles.closeText}>知道了</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  closeBtn: {
    marginTop: 18,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
