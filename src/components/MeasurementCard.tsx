import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  label: string;
  value: number | null;
  unit: string;
  valueColor?: string;
  decimals?: number;
  /** 有傳入時，名稱旁顯示灰色 (?)，點擊呼叫 */
  onInfoPress?: () => void;
};

export function MeasurementCard({ label, value, unit, valueColor, decimals = 1, onInfoPress }: Props) {
  const hasValue = value !== null;

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {onInfoPress ? (
          <TouchableOpacity onPress={onInfoPress} hitSlop={10} testID={`info-${label}`}>
            <Text style={styles.info}>(?)</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={[
        styles.value,
        !hasValue && styles.valuePlaceholder,
        hasValue && valueColor ? { color: valueColor } : undefined,
      ]}>
        {hasValue ? value.toFixed(decimals) : '──'}
      </Text>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 90,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  info: {
    fontSize: 11,
    color: '#B5B5B5',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  valuePlaceholder: {
    fontSize: 18,
    color: Colors.border,
    fontWeight: '400',
  },
  unit: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
