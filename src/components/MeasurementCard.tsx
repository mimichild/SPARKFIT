import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  label: string;
  value: number | null;
  unit: string;
};

export function MeasurementCard({ label, value, unit }: Props) {
  const hasValue = value !== null;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, !hasValue && styles.valuePlaceholder]}>
        {hasValue ? value.toFixed(1) : '──'}
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
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
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
