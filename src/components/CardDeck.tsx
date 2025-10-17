import React, { useRef } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../constants';

const { width: screenWidth } = Dimensions.get('window');

interface CardDeckProps {
  items: any[];
  currentIndex: number;
  onNext: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  renderCard: (item: any, index: number, relativeIndex: number, isTopCard: boolean) => React.ReactNode;
  showSkipButton?: (currentIndex: number) => boolean;
  cardWidth?: number;
  cardHeight?: number;
  maxVisibleCards?: number;
}

const CardDeck: React.FC<CardDeckProps> = ({
  items,
  currentIndex,
  onNext,
  onSkip,
  onComplete,
  renderCard,
  showSkipButton,
  cardWidth = screenWidth * 0.85,
  cardHeight = screenWidth * 0.6,
  maxVisibleCards = 3,
}) => {
  // Animation values for card gestures
  const position = useRef(new Animated.ValueXY()).current;

  // Animation interpolations
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const cardBackgroundColor = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: [COLORS.surface, COLORS.surface, COLORS.primary],
    extrapolate: 'clamp',
  });

  const leftIndicatorOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 2, -screenWidth / 4, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const rightIndicatorOpacity = position.x.interpolate({
    inputRange: [0, screenWidth / 4, screenWidth / 2],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const leftIndicatorScale = position.x.interpolate({
    inputRange: [-screenWidth / 2, -screenWidth / 4, 0],
    outputRange: [1.4, 1.2, 1],
    extrapolate: 'clamp',
  });

  const rightIndicatorScale = position.x.interpolate({
    inputRange: [0, screenWidth / 4, screenWidth / 2],
    outputRange: [1, 1.2, 1.4],
    extrapolate: 'clamp',
  });

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 120) {
        // Swipe right - next/complete
        handleNext();
      } else if (gestureState.dx < -120) {
        // Swipe left - skip
        handleSkip();
      } else {
        // Return to center
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      nextCard('right');
    } else {
      // Animate the last card out before completing
      nextCard('right');
    }
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      nextCard('left');
    } else {
      onComplete?.();
    }
  };

  const nextCard = (direction: 'left' | 'right') => {
    const exitX = direction === 'right' ? screenWidth : -screenWidth;
    
    Animated.timing(position, {
      toValue: { x: exitX, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (currentIndex < items.length - 1) {
        if (direction === 'left' && onSkip) {
          // This was a skip action
          onSkip();
        } else {
          // This was a next action
          onNext();
        }
        position.setValue({ x: 0, y: 0 });
      } else {
        // This is the last card, complete the deck
        onComplete?.();
        position.setValue({ x: 0, y: 0 });
      }
    });
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
        { translateX: isTopCard ? position.x : 0 },
        { translateY: isTopCard ? position.y : 0 },
        { rotate: isTopCard ? rotate : '0deg' },
        { scale: scaleFactor },
      ],
      backgroundColor: isTopCard ? cardBackgroundColor : COLORS.surface,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    };

    return (
      <Animated.View
        key={item.id || index}
        style={cardStyle}
        {...(isTopCard ? panResponder.panHandlers : {})}
      >
        {renderCard(item, index, relativeIndex, isTopCard)}
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
          {/* Swipe Indicators */}
          {showSkipButton?.(currentIndex) && (
            <Animated.View 
              style={{
                position: 'absolute',
                left: -SPACING.lg,
                top: 0,
                bottom: 0,
                width: 60,
                opacity: leftIndicatorOpacity,
                transform: [{ scaleX: leftIndicatorScale }],
                zIndex: 20,
              }}
            >
              <LinearGradient
                colors={[COLORS.disabled, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  paddingLeft: 20,
                }}
              >
                <Animated.Text style={{
                  color: COLORS.surface,
                  fontWeight: 'bold',
                  fontSize: 14,
                  transform: [{ rotate: '-90deg' }],
                }}>
                  SKIP
                </Animated.Text>
              </LinearGradient>
            </Animated.View>
          )}
          
          <Animated.View 
            style={{
              position: 'absolute',
              right: -SPACING.lg,
              top: 0,
              bottom: 0,
              width: 60,
              opacity: rightIndicatorOpacity,
              transform: [{ scaleX: rightIndicatorScale }],
              zIndex: 20,
            }}
          >
            <LinearGradient
              colors={['transparent', COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'flex-end',
                paddingRight: 20,
              }}
            >
              <Animated.Text style={{
                color: COLORS.surface,
                fontWeight: 'bold',
                fontSize: 14,
                transform: [{ rotate: '90deg' }],
              }}>
                {currentIndex === items.length - 1 ? 'START' : 'NEXT'}
              </Animated.Text>
            </LinearGradient>
          </Animated.View>

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

export default CardDeck;
