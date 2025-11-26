import React from 'react';
import {
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
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
  const effectiveCardWidth = cardWidth || Math.min(screenWidth * 0.95, 400);
  // Use flexible height that adapts to content but respects max
  // Account for button overlap (28px), tab bar height (~80px), and bottom padding to avoid overlapping
  const buttonOverlap = 28; // Half of button height (56px / 2)
  const tabBarHeight = 80; // Approximate tab bar height (including floating button)
  const bottomPadding = 32; // Extra spacing below deck wrapper
  // Calculate available height: screen height minus tab bar, button overlap, and padding
  // Use a responsive percentage based on screen height - smaller screens get less height
  const availableHeight = screenHeight - tabBarHeight - buttonOverlap - bottomPadding;
  // Use a percentage of available height, with a minimum to ensure usability
  // Smaller screens (like iPhone 13 Pro) will get a smaller percentage
  const heightPercentage = screenHeight < 900 ? 0.5 : 0.55; // 50% for smaller screens, 55% for larger
  const calculatedHeight = availableHeight * heightPercentage;
  const effectiveCardHeight = cardHeight || Math.max(350, Math.min(calculatedHeight, 650));

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

  // Get visible cards for stacking effect (current + next 2-3 cards behind)
  const visibleCards = !isComplete && currentItem
    ? items
        .map((item, index) => ({ item, index }))
        .filter(({ index }) => index >= currentIndex)
        .slice(0, maxVisibleCards)
    : [];

  const renderStackedCard = (item: any, index: number, relativeIndex: number) => {
    const isTopCard = relativeIndex === 0;
    
    // Calculate scale and opacity for stacked effect
    const scaleFactor = isTopCard ? 1 : 0.95 - (relativeIndex - 1) * 0.03;
    
    // For background cards, calculate position to show just a peek at the top
    // relativeIndex 1 = first card behind (show ~8px), relativeIndex 2 = second card behind (show ~10px), etc.
    // For relativeIndex 1: peekHeight = 8 + (1-1)*2 = 8px
    // For relativeIndex 2: peekHeight = 8 + (2-1)*2 = 10px
    // For relativeIndex 3: peekHeight = 8 + (3-1)*2 = 12px
    const peekHeight = isTopCard ? 0 : 8 + ((relativeIndex - 1) * 2);
    
    // Position background card so only peekHeight is visible above the top card
    // The top card sits at paddingTop (20px) from the top of deckWrapper
    // We want the background card's bottom edge to be at (paddingTop - peekHeight) from the top
    // Since the card is effectiveCardHeight tall, its top should be at: (paddingTop - peekHeight) - effectiveCardHeight
    // Example: paddingTop=20px, cardHeight=500px, peekHeight=8px -> top = (20-8)-500 = -488px
    // This positions the card so only the bottom 8px shows above the top card
    const paddingTop = 20; // Space for background card peeks
    const topOffset = isTopCard ? 0 : (paddingTop - peekHeight) - (24 * relativeIndex);

    if (isTopCard) {
      // Top card - natural flow, no absolute positioning
      // Structure: cardWrapper > [cardShadowContainer (clips content), buttonContainer (outside clip)]
      return (
        <View
          key={item.id || index}
          style={[
            styles.cardWrapper,
            {
              width: effectiveCardWidth,
              zIndex: maxVisibleCards - relativeIndex,
              // Add margin bottom to make room for buttons hanging off
              marginBottom: buttonOverlap,
            },
          ]}
        >
          {/* Card container - clips overflow but buttons are outside */}
          <View style={[
            styles.cardShadowContainer, 
            { 
              width: effectiveCardWidth, 
              height: effectiveCardHeight,
            }
          ]}>
            {/* Scrollable content area */}
            <ScrollView 
              style={[styles.cardInner, { height: effectiveCardHeight }]}
              contentContainerStyle={styles.cardInnerContent}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            >
              {renderCard(item, index, relativeIndex, true)}
            </ScrollView>
          </View>
          {/* Buttons OUTSIDE the clipping container - positioned relative to cardWrapper */}
          <View style={[styles.buttonContainer, { width: effectiveCardWidth }]}>
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
      );
    } else {
      // Background cards - absolute positioning to peek behind top card
      // Use same height as top card for consistency
      return (
        <View
          key={item.id || index}
          pointerEvents="none"
          style={[
            styles.backgroundCardWrapper,
            {
              top: topOffset,
              zIndex: maxVisibleCards - relativeIndex,
              transform: [{ scale: scaleFactor }],
            },
          ]}
        >
          {/* Card container - clips overflow */}
          <View style={[
            styles.cardShadowContainer, 
            { 
              width: effectiveCardWidth, 
              height: effectiveCardHeight,
            }
          ]}>
            {/* Scrollable content area */}
            <ScrollView 
              style={[styles.cardInner, { height: effectiveCardHeight }]}
              contentContainerStyle={styles.cardInnerContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            >
              {renderCard(item, index, relativeIndex, false)}
            </ScrollView>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {isComplete ? (
        <View style={styles.completionPlaceholder}>
          {/* Completion content will be rendered by parent */}
        </View>
      ) : visibleCards.length > 0 ? (
        <View style={[styles.deckWrapper, { paddingTop: 20, paddingBottom: 40 }]}>
          {/* Render background cards first (behind) - absolute positioned */}
          {visibleCards.slice(1).reverse().map(({ item, index }, reverseIndex) => {
            const relativeIndex = visibleCards.length - 1 - reverseIndex;
            return renderStackedCard(item, index, relativeIndex);
          })}
          {/* Render top card last (on top) - natural flow */}
          {renderStackedCard(visibleCards[0].item, visibleCards[0].index, 0)}
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
  deckWrapper: {
    width: '100%',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    // Don't use overflow: hidden here - it clips shadows
    // Background cards will be positioned to show only peekHeight
  },
  cardWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCardWrapper: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    left: 0,
  },
  cardShadowContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden', // Clip scrollable content within the card
    ...SHADOWS.medium,
  },
  cardInner: {
    width: '100%',
    borderRadius: 20,
    ...Platform.select({
      web: {
        // Ensure ScrollView works on web
        overflowY: 'auto',
        overflowX: 'hidden',
      },
      default: {
        flex: 1,
      },
    }),
  },
  cardInnerContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl, // Add padding at bottom so content isn't hidden behind buttons
  },
  buttonContainer: {
    position: 'absolute',
    bottom: -28, // Hang buttons 28px below card (half of 56px button height)
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    zIndex: 10, // Ensure buttons are above card
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
