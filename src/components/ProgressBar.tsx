import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
  height?: number;
  style?: any;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  showText = true, 
  height = 16,
  style 
}) => {
  const percentage = (current / total) * 100;

  return (
    <View style={[styles.container, style]}>
      {showText && (
        <Text style={styles.progressText}>
          {current} of {total} completed
        </Text>
      )}
      <View style={[styles.progressBar, { height }]}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${percentage}%` }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    backgroundColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.progress,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0px 0px 12px ${COLORS.progress}99`,
      },
    }),
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.progress,
    borderRadius: 8,
  },
});

export default ProgressBar;
