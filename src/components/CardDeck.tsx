import React from 'react';
import {
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, SHADOWS, TYPOGRAPHY } from '../constants';

const { width: screenWidth } = Dimensions.get('window');

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
  cardWidth = screenWidth * 0.85,
  cardHeight = screenWidth * 0.6,
  maxVisibleCards = 3,
  primaryButtonText = 'Yes',
  secondaryButtonText = 'Skip',
  primaryButtonDisabled = false,
  onPrimaryAction,
  onSecondaryAction,
}) => {
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

  const renderCardWithAnimations = (item: any, index: number, relativeIndex: number) => {
    const isTopCard = relativeIndex === 0;
    
    // Calculate scale for inactive cards
    const scaleFactor = isTopCard ? 1 : Math.max(0.95 - (relativeIndex * 0.03), 0.7);

    const cardStyle = {
      position: 'absolute' as const,
      width: cardWidth,
      height: cardHeight,
      bottom: isTopCard ? 160 : 175 + (relativeIndex * 25),
      zIndex: isTopCard ? 10 : 10 - relativeIndex,
      transform: [
        { scale: scaleFactor },
      ],
    };

    const cardInnerStyle = {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: COLORS.surface,
      borderRadius: 20,
      ...SHADOWS.medium,
      overflow: 'hidden' as const,
    };

    return (
      <Animated.View
        key={item.id || index}
        style={cardStyle}
      >
        <View style={cardInnerStyle}>
          {renderCard(item, index, relativeIndex, isTopCard)}
        </View>
        {/* Buttons only on top card - positioned outside card to hang off bottom */}
        {isTopCard && (
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
        )}
      </Animated.View>
    );
  };

  // Check if deck is complete
  const isComplete = currentIndex >= items.length;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      {isComplete ? (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          {/* Completion content will be rendered by parent */}
        </View>
      ) : (
        <>
          {items
            .map((item, index) => ({ item, index }))
            .filter(({ index }) => index >= currentIndex)
            .slice(0, maxVisibleCards)
            .map(({ item, index }, relativeIndex) => 
              renderCardWithAnimations(item, index, relativeIndex)
            )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: -30, // Half of button height (60px / 2 = 30px) to create 50% overlap
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  button: {
    height: 60,
    minWidth: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.medium,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 20, // 40px gap total (20px on each side)
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 20, // 40px gap total (20px on each side)
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
});

export default CardDeck;
