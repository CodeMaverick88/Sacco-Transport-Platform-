import React, { useMemo, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { TabKey } from './AppTabs';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'HOME', label: 'Home', icon: '🏠' },
  { key: 'BOOKINGS', label: 'Bookings', icon: '🧾' },
  { key: 'PARCELS', label: 'Parcels', icon: '📦' },
  { key: 'PROFILE', label: 'Profile', icon: '👤' },
];

type Props = {
  active: TabKey;
  onTabChange: (t: TabKey) => void;
  style?: ViewStyle;
};

export default function BottomTabBar({ active, onTabChange, style }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const glow = useMemo(() => new Animated.Value(0), []);

  const onHoverIn = () => {
    Animated.timing(glow, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  };
  const onHoverOut = () => {
    Animated.timing(glow, { toValue: 0, duration: 220, useNativeDriver: false }).start();
  };

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', 'rgba(250, 204, 21, 0.18)'], // soft dark yellow glow
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          shadowColor: '#000',
        },
        { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.18)' },
      ]}>
      <Animated.View pointerEvents="none" style={[styles.glow, { backgroundColor: glowColor }]} />
      <View style={styles.inner}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Pressable
              key={t.key}
              onPress={() => onTabChange(t.key)}
              onHoverIn={() => {
                setHovered(t.key);
                if (Platform.OS === 'web') onHoverIn();
              }}
              onHoverOut={() => {
                setHovered(null);
                if (Platform.OS === 'web') onHoverOut();
              }}
              style={({ pressed }) => [
                styles.btn,
                isActive && styles.btnActive,
                pressed && { opacity: 0.8 },
              ]}>
              <Text style={[styles.icon]}>{t.icon}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 28,
    padding: 6,
    // glass effect
    borderWidth: 1,
    // shadows
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 36,
    zIndex: -1,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  btn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 64,
  },
  btnActive: {
    backgroundColor: '#FFF6E0',
  },
  icon: {
    fontSize: 18,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  labelActive: {
    color: '#7A4D00', // dark yellow-ish accent
  },
});