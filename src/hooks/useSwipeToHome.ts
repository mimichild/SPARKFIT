import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export function useSwipeToHome() {
  const router = useRouter();

  const goHome = useCallback(() => {
    router.back();
  }, [router]);

  // Activates for rightward swipes; fails fast on vertical movement so
  // ScrollViews can still scroll normally.
  return Gesture.Pan()
    .activeOffsetX([30, 99999])
    .failOffsetY([-40, 40])
    .onFinalize((e) => {
      'worklet';
      if (e.translationX > 70 && e.velocityX > 80) {
        runOnJS(goHome)();
      }
    });
}
