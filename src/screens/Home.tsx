import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@current_user').then((raw) => {
      if (raw) {
        try {
          const u = JSON.parse(raw);
          setUserName(u.name || null);
        } catch {
          setUserName(null);
        }
      }
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome{userName ? `, ${userName}` : ''} 👋</Text>
        <Text style={styles.sub}>MEISON SACCO LOGISTICS — Passenger & Parcel platform</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What this app does</Text>
        <Text style={styles.cardText}>
          This app helps you book seats, register parcels with waybills and QR codes, track parcel status and view trip details with live updates.
        </Text>
        <Image source={require('../assets/public/feature-samples.jpg')} style={styles.hero} resizeMode="cover" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Who it's for</Text>
        <Text style={styles.cardText}>
          Passengers, Sacco Clerks, Conductors and Sacco Admins — everything connected to one vehicle & trip.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick actions</Text>
        <Text style={styles.cardText}>Use the bottom tab bar to open Bookings, Parcels, or your Profile quickly.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: 120, backgroundColor: '#fff' },
  header: { marginBottom: 12 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
  sub: { color: '#6B7280', marginTop: 6 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6EEF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  cardTitle: { fontWeight: '800', fontSize: 16, marginBottom: 8, color: '#0F172A' },
  cardText: { color: '#475569' },
  hero: { width: '100%', height: 140, borderRadius: 8, marginTop: 10 },
});