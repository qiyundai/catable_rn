import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants';

export interface WheelPickerItem {
  label: string;
  value: number | string;
}

interface WheelPickerProps {
  items: WheelPickerItem[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  width?: number;
  height?: number;
}

const WheelPicker: React.FC<WheelPickerProps> = ({ 
  items, 
  selectedIndex, 
  onSelectionChange,
  width = 80,
  height = 200,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 40;
  const paddingTop = itemHeight * 2; // 2 items above center
  const paddingBottom = itemHeight * 2; // 2 items below center
  const isUserScrolling = useRef(false);
  const isInitialized = useRef(false);

  // Calculate scroll position for an index
  const getScrollYForIndex = (index: number): number => {
    return index * itemHeight;
  };

  // Initial scroll to selected index (no animation) - only once
  useEffect(() => {
    if (!isInitialized.current && items.length > 0 && selectedIndex >= 0 && selectedIndex < items.length) {
      // Small delay to ensure layout is complete
      const timer = setTimeout(() => {
        const scrollY = getScrollYForIndex(selectedIndex);
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: false,
        });
        isInitialized.current = true;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [items.length]); // Re-initialize if items change

  // Handle programmatic selectedIndex changes (with animation) - only after initialization
  useEffect(() => {
    if (isInitialized.current && !isUserScrolling.current && items.length > 0 && selectedIndex >= 0 && selectedIndex < items.length) {
      const scrollY = getScrollYForIndex(selectedIndex);
      scrollViewRef.current?.scrollTo({
        y: scrollY,
        animated: true,
      });
    }
  }, [selectedIndex]);

  const handleScrollBeginDrag = () => {
    isUserScrolling.current = true;
  };

  const handleScroll = (event: any) => {
    if (!isInitialized.current) return;
    
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    
    // Update selection during scroll (but don't interfere with scrolling)
    if (index >= 0 && index < items.length && index !== selectedIndex) {
      onSelectionChange(index);
    }
  };

  const handleMomentumScrollEnd = (event: any) => {
    isUserScrolling.current = false;
    
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    
    // Snap to nearest item
    if (index >= 0 && index < items.length) {
      const targetY = getScrollYForIndex(index);
      const currentY = event.nativeEvent.contentOffset.y;
      
      // Only snap if we're significantly off (avoid unnecessary animations)
      if (Math.abs(currentY - targetY) > 2) {
        scrollViewRef.current?.scrollTo({
          y: targetY,
          animated: true,
        });
      }
      
      // Update selection if changed
      if (index !== selectedIndex) {
        onSelectionChange(index);
      }
    }
  };

  const totalContentHeight = items.length * itemHeight + paddingTop + paddingBottom;

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={[styles.mask, { width, height }]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.content,
            { 
              paddingTop,
              paddingBottom,
              minHeight: totalContentHeight,
            }
          ]}
          style={[styles.scrollView, { height }]}
          nestedScrollEnabled={true}
        >
          {items.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={[
                styles.itemText,
                index === selectedIndex && styles.itemTextSelected
              ]}>
                {item.label}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        {/* Selection indicator overlay */}
        <View style={[styles.overlay, { width, height }]}>
          <View style={styles.selectionLine} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: {
    overflow: 'hidden',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    // Padding handled dynamically
  },
  item: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  itemTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  selectionLine: {
    width: '100%',
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
});

export default WheelPicker;
