import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChainOfCustodyEvent } from '@/type/parcel';

interface Props {
  events: ChainOfCustodyEvent[];
}

export const Timeline: React.FC<Props> = ({ events }) => {
  return (
    <View style={styles.container}>
      {events.map((item, index) => {
        const isLast = index === events.length - 1;
        return (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.leftColumn}>
              <Text style={styles.timeText}>{item.timestamp}</Text>
            </View>

            <View style={styles.centerColumn}>
              <View style={[styles.dot, isLast && styles.dotActive]} />
              {!isLast && <View style={styles.line} />}
            </View>

            <View style={styles.rightColumn}>
              <Text style={styles.statusText}>
                {item.status.replace(/_/g, ' ')}
              </Text>
              <Text style={styles.locationText}>{item.locationName}</Text>
              <Text style={styles.actorText}>By: {item.actorName}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    minHeight: 62,
    alignItems: 'flex-start',
  },
  leftColumn: {
    width: 80,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  centerColumn: {
    width: 26,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9CA3AF',
    marginTop: 2,
  },
  dotActive: {
    backgroundColor: '#0F9D58',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 6,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#374151',
  },
  actorText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
});