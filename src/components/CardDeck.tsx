import React from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../constants';

interface CardDeckProps {
  items: any[];
  currentIndex: number;
  onNext: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  renderCard: (item: any, index: number, relativeIndex: number, isTopCard: boolean) => React.ReactNode;
  cardWidth?: number;
  cardHeight?: number;
  maxVisibleCards?: number;
  // Button configuration
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonDisabled?: boolean;
  onPrimaryAction?: (item: any, index: number) => void;
  onSecondaryAction?: (item: any, index: number) => void;
}

const CardDeck: React.FC<CardDeckProps> = ({
  items,
  currentIndex,
  onNext,
  onSkip,
  onComplete,
  renderCard,
  cardWidth,
  cardHeight,
  maxVisibleCards = 3,
  primaryButtonText = 'Yes',
  secondaryButtonText = 'Skip',
  primaryButtonDisabled = false,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Use provided dimensions or calculate responsive defaults
  // Max width ensures cards don't get too wide on tablets
  const effectiveCardWidth = cardWidth || Math.min(screenWidth * 0.9, 400);
  // Use flexible height that adapts to content but respects max
  const effectiveCardHeight = cardHeight || Math.min(screenHeight * 0.65, 600);

  const handlePrimaryAction = () => {
    if (primaryButtonDisabled) return;
    const currentItem = items[currentIndex];
    if (onPrimaryAction) {
      onPrimaryAction(currentItem, currentIndex);
    } else {
      if (currentIndex < items.length - 1) {
        onNext();
      } else {
        onComplete?.();
      }
    }
  };

  const handleSecondaryAction = () => {
    const currentItem = items[currentIndex];
    if (onSecondaryAction) {
      onSecondaryAction(currentItem, currentIndex);
    } else if (onSkip) {
      onSkip();
    }
  };

  // Check if deck is complete
  const isComplete = currentIndex >= items.length;
  const currentItem = !isComplete ? items[currentIndex] : null;

  return (
    <View style={styles.container}>
      {isComplete ? (
        <View style={styles.completionPlaceholder}>
          {/* Completion content will be rendered by parent */}
        </View>
      ) : currentItem ? (
        <View style={[styles.cardWrapper, { width: effectiveCardWidth }]}>
          <View style={[styles.cardContainer, { width: effectiveCardWidth, height: effectiveCardHeight }]}>
            <View style={styles.cardInnerContainer}>
              <ScrollView 
                style={styles.cardInner}
                contentContainerStyle={styles.cardInnerContent}
                showsVerticalScrollIndicator={false}
              >
                {renderCard(currentItem, currentIndex, 0, true)}
              </ScrollView>
            </View>
            {/* Buttons part of natural flow */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSecondaryAction}
              >
                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.primaryButton,
                  primaryButtonDisabled && styles.primaryButtonDisabled
                ]}
                onPress={handlePrimaryAction}
                disabled={primaryButtonDisabled}
              >
                <Text style={[
                  styles.primaryButtonText,
                  primaryButtonDisabled && styles.primaryButtonTextDisabled
                ]}>
                  {primaryButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    ...SHADOWS.medium,
    flexDirection: 'column',
  },
  cardInnerContainer: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardInner: {
    width: '100%',
    flex: 1,
  },
  cardInnerContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  button: {
    flex: 1,
    maxWidth: 150,
    height: 56,
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.medium,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  primaryButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  completionPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default CardDeck;
