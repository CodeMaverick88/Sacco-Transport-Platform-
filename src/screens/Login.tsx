import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  onLogin: (user: { id: string; name: string; email?: string }) => void;
};

// Ensure images exist at src/assets/public/hero1.jpg hero2.jpg hero3.jpg
const IMAGES = [
  require('@/assets/images/vision board.png'),
  require('@/assets/images/vision board.png'),
  require('@/assets/images/vision board.png'),
];

export default function Login({ onLogin }: Props) {
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');

  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;

  const carouselTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const fadeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    carouselTimer.current = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, 5000);
    return () => {
      if (carouselTimer.current) {
        clearInterval(carouselTimer.current);
        carouselTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 4500, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 4500, useNativeDriver: true }),
      ]),
    );
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.98, duration: 4500, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1.0, duration: 4500, useNativeDriver: true }),
      ]),
    );
    scaleAnimRef.current = scaleLoop;
    fadeAnimRef.current = fadeLoop;
    scaleLoop.start();
    fadeLoop.start();
    return () => {
      try {
        scaleAnimRef.current?.stop();
        fadeAnimRef.current?.stop();
      } catch {}
    };
  }, [scale, fade]);

  const validateAndSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPin = pin.trim();
    if (!trimmedName) return alert('Please enter your name');
    if (!/^\d{4}$/.test(trimmedPin)) return alert('PIN must be exactly 4 digits');

    const user = { id: 'u-' + Date.now(), name: trimmedName, email: email.trim() || undefined };
    try {
      await AsyncStorage.setItem('@current_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      console.error('Failed to persist user', err);
      alert('An error occurred while signing in. Try again.');
    }
  };

  const onPinSubmit = (_e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    validateAndSubmit();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Animated.Image source={IMAGES[index]} style={[StyleSheet.absoluteFill, { transform: [{ scale }], opacity: fade }]} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <View style={styles.formWrap}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#999" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextInput style={styles.input} placeholder="Email (optional)" placeholderTextColor="#999" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="4-digit PIN" placeholderTextColor="#999" keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'} secureTextEntry maxLength={4} value={pin} onChangeText={(t) => setPin(t.replace(/[^\d]/g, ''))} returnKeyType="done" onSubmitEditing={onPinSubmit} />

        <Pressable style={({ pressed }) => [styles.cta, pressed && { opacity: 0.88 }]} onPress={validateAndSubmit}>
          <Text style={styles.ctaText}>Enter</Text>
        </Pressable>

        <Text style={styles.hint}>By signing in you accept the Terms. PINs are stored securely on the server — do not store them in plaintext.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  overlay: { backgroundColor: 'rgba(8,10,16,0.28)' },
  formWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  title: { fontSize: 34, color: '#fff', fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#fff', marginBottom: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    color: '#111827',
    fontWeight: '600',
  },
  cta: {
    backgroundColor: '#FBBF24',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  ctaText: { fontWeight: '800', color: '#1E293B' },
  hint: { color: 'rgba(255,255,255,0.92)', fontSize: 12, marginTop: 10, opacity: 0.95 },
});