import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Parcels() {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Parcels</Text>
      <Text style={styles.subtitle}>Parcel registration, tracking and manifest tools will appear here.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Register parcel</Text>
        <Text style={styles.cardText}>Stage clerks and conductors will be able to register and scan parcels here.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: 120, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748B', marginTop: 6, marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E6EEF8',
  },
  cardTitle: { fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  cardText: { color: '#475569' },
});