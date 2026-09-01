import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Bookings() {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>Passenger bookings and history will appear here.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>No bookings yet</Text>
        <Text style={styles.cardText}>When you make bookings they will show up here.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: 120, backgroundColor: '#fff' },
  header: { marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#64748B', marginTop: 6 },
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