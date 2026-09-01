import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = { onLogout: () => void };

export default function Profile({ onLogout }: Props) {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@current_user').then((raw: string | null) => {
      if (raw) setUser(JSON.parse(raw));
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.field}>Name</Text>
        <Text style={styles.value}>{user?.name || '-'}</Text>
        <Text style={[styles.field, { marginTop: 10 }]}>Email</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>

        <View style={{ marginTop: 16 }}>
          <Button title="Logout" onPress={onLogout} color="#DC2626" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 18, paddingBottom: 120, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6EEF8',
  },
  field: { color: '#94A3B8', fontSize: 12 },
  value: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
});