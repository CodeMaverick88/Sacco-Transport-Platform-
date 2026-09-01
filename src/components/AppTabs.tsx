import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TabKey } from '@/type/navigation';
import Login from '../screens/Login';
import Home from '../screens/Home';
import Bookings from '../screens/Bookings';
import Parcels from '../screens/Parcels';
import Profile from '../screens/Profile';
import BottomTabBar from '@/components/BottomTabbar';

export default function AppTabs() {
  const [currentTab, setCurrentTab] = useState<TabKey>('LOGIN');
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@current_user').then((raw: string | null) => {
      if (raw) {
        setCurrentTab('HOME');
      } else {
        setCurrentTab('LOGIN');
      }
      setUserLoaded(true);
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@current_user');
    setCurrentTab('LOGIN');
  };

  const handleLogin = async (user: { id: string; name: string; email?: string }) => {
    await AsyncStorage.setItem('@current_user', JSON.stringify(user));
    setCurrentTab('HOME');
  };

  if (!userLoaded) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        {currentTab === 'LOGIN' && <Login onLogin={handleLogin} />}
        {currentTab === 'HOME' && <Home />}
        {currentTab === 'BOOKINGS' && <Bookings />}
        {currentTab === 'PARCELS' && <Parcels />}
        {currentTab === 'PROFILE' && <Profile onLogout={handleLogout} />}
      </View>

      {currentTab !== 'LOGIN' && (
        <BottomTabBar active={currentTab} onTabChange={(t) => setCurrentTab(t)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  screen: { flex: 1 },
});