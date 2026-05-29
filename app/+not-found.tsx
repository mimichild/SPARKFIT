import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '找不到頁面' }} />
      <View style={styles.container}>
        <Text style={styles.title}>此頁面不存在</Text>
        <Link href="/" style={styles.link}>
          <Text>返回首頁</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    paddingVertical: 16,
  },
});
