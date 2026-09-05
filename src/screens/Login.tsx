import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { BlurView } from "expo-blur"; // optional, nice glass effect (install expo-blur)
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Login screen for FIKISHA
 * - Sign up / Sign in toggle
 * - Strong password suggestion + validation
 * - 4-background cinematic crossfade + zoom-in
 * - Glass UI form with blur (optional)
 * - Calls backend endpoints for /auth/register and /auth/login
 *
 * Backend endpoints (see instructions below):
 * POST ${BACKEND_URL}/auth/register  { name, email, password }
 * POST ${BACKEND_URL}/auth/login     { email, password }
 *
 * On success login returns { token, user: { id, name, email } }
 * Store token securely using SecureStore.setItemAsync('token', token)
 */

const BACKEND_URL = "https://your-api.example.com"; // <-- replace with your real backend

const BG = [
  require("../assets/public/hero1.jpg"),
  require("../assets/public/hero2.jpg"),
  require("../assets/public/hero3.jpg"),
  require("../assets/public/hero4.jpg"),
];

type Mode = "SIGNUP" | "SIGNIN";

export default function Login({
  onLogin,
}: {
  onLogin: (user: { id: string; name: string; email?: string }) => void;
}) {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<Mode>("SIGNUP");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [suggested, setSuggested] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const [loading, setLoading] = useState(false);

  // background animation refs
  const [index, setIndex] = useState(0);
  const fadeA = useRef(new Animated.Value(1)).current;
  const scaleA = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // generate suggestion on mount
    setSuggested(generatePassword(12));

    // start carousel
    startCarousel();
    return stopCarousel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCarousel() {
    stopCarousel();
    timerRef.current = setInterval(() => {
      // crossfade to next
      Animated.parallel([
        Animated.timing(fadeA, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIndex((i) => (i + 1) % BG.length);
        // reset fade to 0 then fade in
        fadeA.setValue(0);
        Animated.parallel([
          Animated.timing(fadeA, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });

      // zoom-in effect on every image: scale from 1 to 1.06 for the image, then reset when image changes
      scaleA.setValue(1);
      Animated.timing(scaleA, {
        toValue: 1.06,
        duration: 4800,
        useNativeDriver: true,
      }).start();
    }, 5200);
  }

  function stopCarousel() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // password helpers
  function generatePassword(length = 12) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}<>?";
    const all = upper + lower + digits + symbols;
    let pwd = "";
    // guarantee required chars
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += digits[Math.floor(Math.random() * digits.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 4; i < length; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    // shuffle
    return pwd
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  }

  function validatePassword(p: string) {
    const checks = {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      digit: /[0-9]/.test(p),
      symbol: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\]/.test(p),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  }

  async function handleSubmit() {
    // Basic client validations
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return Alert.alert(
        "Invalid email",
        "Please enter a valid email address.",
      );
    }
    if (mode === "SIGNUP" && (!name || name.trim().length < 2)) {
      return Alert.alert("Invalid name", "Please enter your full name.");
    }
    if (!password) {
      return Alert.alert(
        "Password required",
        "Please provide a secure password or use suggestion.",
      );
    }
    const validation = validatePassword(password);
    if (validation.score < 4) {
      return Alert.alert(
        "Weak password",
        "Your password should include upper, lower, digit and symbol, and be at least 8 characters.",
      );
    }

    setLoading(true);

    try {
      if (mode === "SIGNUP") {
        const res = await fetch(`${BACKEND_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(
            errorBody.message || `Register failed (${res.status})`,
          );
        }
        // server should respond with a message like { ok: true, message: 'verification email sent' }
        const body = await res.json();
        Alert.alert(
          "Registration",
          body.message || "Check your email to verify your account.",
        );
        // After registration we typically prompt the user to check email and then sign in after verification
      } else {
        // Sign in
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody.message || `Login failed (${res.status})`);
        }
        const body = await res.json();
        // expected: { token, user: { id, name, email } }
        const { token, user } = body;
        if (!token || !user) throw new Error("Invalid server response");
        // store token securely
        await SecureStore.setItemAsync("fikisha_token", token);
        // propagate login up (AppTabs will set currentTab = 'HOME')
        onLogin(user);
      }
    } catch (err: any) {
      console.error("Auth error", err);
      Alert.alert("Error", err.message || "An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function acceptSuggested() {
    setPassword(suggested);
    setShowSuggestion(false);
  }

  // optional: quick toggle between modes
  const toggleMode = () => {
    setMode((m) => (m === "SIGNUP" ? "SIGNIN" : "SIGNUP"));
  };

  const passValidation = validatePassword(password);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Background image with crossfade & zoom-in */}
      <Animated.Image
        source={BG[index]}
        style={[
          styles.bgImage,
          { transform: [{ scale: scaleA }], opacity: fadeA },
        ]}
        resizeMode="cover"
      />
      <View style={styles.dim} />

      {/* center content */}
      <View style={styles.centerWrap}>
        <Text style={styles.appTitle}>FIKISHA</Text>

        <BlurView intensity={60} tint="light" style={styles.glassContainer}>
          <View style={styles.formInner}>
            <Text style={styles.head}>
              {mode === "SIGNUP" ? "Create account" : "Sign in"}
            </Text>

            {mode === "SIGNUP" && (
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name (e.g. Meison Mugwe Njonjo)"
                style={styles.input}
                placeholderTextColor="#666"
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email (e.g. meisonramsay@gmail.com)"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              placeholderTextColor="#666"
            />
            <Text style={styles.hintText}>Example: meisonramsay@gmail.com</Text>

            <View style={{ height: 8 }} />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={
                mode === "SIGNUP" ? "Create a strong password" : "Your password"
              }
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#666"
            />

            {/* password strength and suggestion */}
            <View style={styles.passwordRow}>
              <View style={styles.passwordChecks}>
                <Text
                  style={[
                    styles.small,
                    passValidation.checks.length ? styles.good : styles.bad,
                  ]}
                >
                  • min 8
                </Text>
                <Text
                  style={[
                    styles.small,
                    passValidation.checks.upper ? styles.good : styles.bad,
                  ]}
                >
                  • A
                </Text>
                <Text
                  style={[
                    styles.small,
                    passValidation.checks.digit ? styles.good : styles.bad,
                  ]}
                >
                  • 0-9
                </Text>
                <Text
                  style={[
                    styles.small,
                    passValidation.checks.symbol ? styles.good : styles.bad,
                  ]}
                >
                  • #
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setSuggested(generatePassword(12));
                  setShowSuggestion((s) => !s);
                }}
              >
                <Text style={styles.suggestLink}>
                  {showSuggestion ? "Hide suggestion" : "Suggest password"}
                </Text>
              </Pressable>
            </View>

            {showSuggestion && (
              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionText}>{suggested}</Text>
                <Pressable style={styles.useBtn} onPress={acceptSuggested}>
                  <Text style={styles.useBtnText}>Use</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.cta,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#003A3A" />
                  <Text style={styles.ctaText}>Please wait</Text>
                </View>
              ) : (
                <Text style={styles.ctaText}>
                  {mode === "SIGNUP" ? "Create account" : "Sign in"}
                </Text>
              )}
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.small}>Or</Text>
              <Pressable onPress={toggleMode}>
                <Text style={styles.switchLink}>
                  {mode === "SIGNUP"
                    ? "I already have an account"
                    : "Create a new account"}
                </Text>
              </Pressable>
            </View>

            {/* Google sign-in placeholder - implement with expo-auth-session */}
            <Pressable
              style={styles.googleBtn}
              onPress={() =>
                Alert.alert(
                  "Google sign-in",
                  "Configure Google OAuth (expo-auth-session) and your backend to verify id_token.",
                )
              }
            >
              <Text style={styles.googleText}>Sign in with Google</Text>
            </Pressable>
          </View>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.40)",
  }, // lighten BG so form reads well
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 18,
  },
  glassContainer: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 14,
    overflow: "hidden",
    padding: 2,
  },
  formInner: {
    backgroundColor: "rgba(255,255,255,0.78)",
    padding: 18,
    borderRadius: 12,
  },
  head: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 10 },
  input: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 6,
  },
  hintText: { color: "#6B7280", fontSize: 12, marginBottom: 6 },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  passwordChecks: { flexDirection: "row", gap: 8 },
  small: { fontSize: 12, color: "#374151" },
  good: { color: "#0f766e" },
  bad: { color: "#ef4444" },
  suggestLink: { color: "#0f766e", fontWeight: "700" },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "rgba(15,23,42,0.04)",
    borderRadius: 8,
    marginBottom: 10,
  },
  suggestionText: { color: "#0F172A", flex: 1, marginRight: 8 },
  useBtn: {
    backgroundColor: "#0f766e",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  useBtnText: { color: "#fff", fontWeight: "800" },
  cta: {
    backgroundColor: "#0f766e",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  ctaText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchRow: { marginTop: 10, alignItems: "center" },
  switchLink: { color: "#0f766e", marginTop: 6, fontWeight: "700" },
  googleBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  googleText: { color: "#111827", fontWeight: "700" },
});
