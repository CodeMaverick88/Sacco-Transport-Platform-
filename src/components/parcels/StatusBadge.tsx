import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { ParcelStatus } from '@/type/parcel';

interface Props {
  status: ParcelStatus;
}

type BadgeStyle = {
  bg: string;
  text: string;
  label: string;
  container?: ViewStyle;
  textStyle?: TextStyle;
};

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getBadgeStyle = (): BadgeStyle => {
    switch (status) {
      case 'REGISTERED':
        return { bg: '#E6F3FF', text: '#0B6FB3', label: 'REGISTERED' };
      case 'ASSIGNED_TO_TRIP':
        return { bg: '#FFF8E1', text: '#B26A00', label: 'ASSIGNED' };
      case 'LOADED':
        return { bg: '#FFF7ED', text: '#9A5B00', label: 'LOADED' };
      case 'IN_TRANSIT':
        return { bg: '#E6FFF0', text: '#0F9D58', label: 'IN TRANSIT' };
      case 'ARRIVED_AT_STAGE':
        return { bg: '#EEF2FF', text: '#3B3CBF', label: 'AT STAGE' };
      case 'READY_FOR_PICKUP':
        return { bg: '#F6EEFF', text: '#6B21A8', label: 'READY' };
      case 'COLLECTED':
        return { bg: '#E7FFF3', text: '#065F46', label: 'COLLECTED' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  const style = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, shadowColor: style.text }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>{style.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    alignSelf: 'flex-start',
    // shadow for iOS
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // elevation for Android
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});