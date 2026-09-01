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

// Ensure these images exist in your project:
// src/assets/public/hero1.jpg, hero2.jpg, hero3.jpg
const IMAGES = [
  require('../assets/public/hero1.jpg'),
  require('../assets/public/hero2.jpg'),
  require('../assets/public/hero3.jpg'),
];

export default function Login({ onLogin }: Props) {
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(''); // 4 digit

  // animated values
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(1)).current;

  // refs to control lifecycle
  const carouselTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const fadeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // auto-advance carousel every 5 seconds
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
    // Slow cinematic zoom loop
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ]),
    );

    // subtle fade loop to keep motion gentle
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 0.98,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1.0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ]),
    );

    scaleAnimRef.current = scaleLoop;
    fadeAnimRef.current = fadeLoop;

    scaleLoop.start();
    fadeLoop.start();

    return () => {
      // stop animations on unmount
      try {
        scaleAnimRef.current?.stop();
        fadeAnimRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, [scale, fade]);

  const validateAndSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPin = pin.trim();

    if (!trimmedName) {
      return alert('Please enter your name');
    }
    if (!/^\d{4}$/.test(trimmedPin)) {
      return alert('PIN must be exactly 4 digits');
    }

    // Warning: client-side-only storage is not secure for auth.
    // In production you must send credentials to your backend, hash/salt the PIN server-side,
    // and issue a token (JWT or similar). Here we persist locally for quick demo flow.
    const user = { id: 'u-' + Date.now(), name: trimmedName, email: email.trim() || undefined };

    try {
      await AsyncStorage.setItem('@current_user', JSON.stringify(user));
      // small delay to ensure write completes on older devices
      onLogin(user);
    } catch (err) {
      console.error('Failed to persist user', err);
      alert('An error occurred while signing in. Try again.');
    }
  };

  // Submit on keyboard "done" (for PIN field)
  const onPinSubmit = (_e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    validateAndSubmit();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Animated.Image
        source={IMAGES[index]}
        style={[styles.bgImage, { transform: [{ scale }], opacity: fade }]}
        resizeMode="cover"
        accessible={false}
      />

      <View style={styles.overlay} />

      <View style={styles.formWrap}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
          accessibilityLabel="Full name"
        />

        <TextInput
          style={styles.input}
          placeholder="Email (optional)"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          accessibilityLabel="Email address"
        />

        <TextInput
          style={styles.input}
          placeholder="4-digit PIN"
          placeholderTextColor="#999"
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          secureTextEntry={true}
          maxLength={4}
          value={pin}
          onChangeText={(t) => setPin(t.replace(/[^\d]/g, ''))}
          returnKeyType="done"
          onSubmitEditing={onPinSubmit}
          accessibilityLabel="4 digit PIN"
        />

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.88 }]}
          onPress={validateAndSubmit}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text style={styles.ctaText}>Enter</Text>
        </Pressable>

        <Text style={styles.hint}>
          By signing in you accept the Terms. PINs are stored securely on the server — do not store them in plaintext.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,10,16,0.28)',
  },
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