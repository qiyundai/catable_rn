import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

interface WheelPickerProps {
  items: { label: string; value: number }[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
}

const WheelPicker: React.FC<WheelPickerProps> = ({ items, selectedIndex, onSelectionChange }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 40;
  const visibleItems = 5; // Show 5 items (2 above, 1 center, 2 below)
  const containerHeight = itemHeight * visibleItems;

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight); // Subtract 2 to account for top padding items
    if (index >= 0 && index < items.length && index !== selectedIndex) {
      onSelectionChange(index);
    }
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      y: (index) * itemHeight, // Add 2 to account for top padding items
      animated: true,
    });
  };

  // Scroll to selected index when component mounts or selectedIndex changes
  React.useEffect(() => {
    scrollToIndex(selectedIndex);
  }, [selectedIndex]);

  return (
    <View style={styles.wheelPickerContainer}>
      <View style={styles.wheelPickerMask}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.wheelPickerContent}
          style={styles.wheelPickerScrollView}
        >
          {/* Add padding items at the top */}
          {/* {Array.from({ length: 2 }, (_, i) => (
            <View key={`padding-top-${i}`} style={styles.wheelPickerItem}>
              <Text style={styles.wheelPickerItemText}></Text>
            </View>
          ))} */}
          
          {/* Actual items */}
          {items.map((item, index) => (
            <View key={index} style={styles.wheelPickerItem}>
              <Text style={[
                styles.wheelPickerItemText,
                index === selectedIndex && styles.wheelPickerItemTextSelected
              ]}>
                {item.label}
              </Text>
            </View>
          ))}
          
          {/* Add padding items at the bottom */}
          {/* {Array.from({ length: 2 }, (_, i) => (
            <View key={`padding-bottom-${i}`} style={styles.wheelPickerItem}>
              <Text style={styles.wheelPickerItemText}></Text>
            </View>
          ))} */}
        </ScrollView>
        
        {/* Selection indicator overlay */}
        <View style={styles.wheelPickerSelectionOverlay}>
          <View style={styles.wheelPickerSelectionLine} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wheelPickerContainer: {
    height: 200,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelPickerMask: {
    height: 200,
    width: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelPickerScrollView: {
    height: 200,
  },
  wheelPickerContent: {
    paddingVertical: 80, // Center the visible items
  },
  wheelPickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelPickerItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  wheelPickerItemTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  wheelPickerSelectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  wheelPickerSelectionLine: {
    width: '100%',
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
});

export default WheelPicker;
