import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import ProgressBar from '../components/ProgressBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75; // 75% of screen width
const CARD_HEIGHT = screenHeight * 0.5; // 50% of screen height

const TasksScreen: React.FC = () => {
  const { currentPet, pets } = useAppStore();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [taskValues, setTaskValues] = useState<{[key: string]: any}>({
    '1': 0, // Water intake
    '2': false, // Feeding
    '3': 2, // Playtime activity
    '4': 2, // Poop consistency
    '5': false, // Litter box
  });
  
  // Mock data for demonstration - daily tasks as cards
  const dailyTasks = [
    {
      id: '1',
      title: 'Water Intake',
      description: 'How much water did your cat drink today?',
      icon: '💧',
      type: 'daily',
      inputType: 'numeric',
      unit: 'ml',
      value: 0,
    },
    {
      id: '2',
      title: 'Feeding',
      description: 'Did your cat eat today?',
      icon: '🍽️',
      type: 'daily',
      inputType: 'yesno',
      value: false,
    },
    {
      id: '3',
      title: 'Playtime Activity',
      description: 'How active was your cat today?',
      icon: '🎾',
      type: 'daily',
      inputType: 'slider',
      options: ['Very Lazy', 'Lazy', 'Normal', 'Active', 'Super Energetic'],
      value: 2,
    },
    {
      id: '4',
      title: 'Poop Consistency',
      description: 'How was your cat\'s poop today?',
      icon: '💩',
      type: 'daily',
      inputType: 'slider',
      options: ['Hard & Dry', 'Firm', 'Normal', 'Soft', 'Watery Diarrhea'],
      value: 2,
    },
    {
      id: '5',
      title: 'Litter Box',
      description: 'Did your cat use the litter box?',
      icon: '📦',
      type: 'daily',
      inputType: 'yesno',
      value: false,
    },
  ];

  const streak = 7; // Mock streak data
  const totalTasks = dailyTasks.length;

  // Helper functions to update task values
  const updateTaskValue = (taskId: string, value: any) => {
    setTaskValues(prev => ({
      ...prev,
      [taskId]: value
    }));
  };

  const getCurrentTask = () => dailyTasks[currentCardIndex];
  const getCurrentTaskValue = () => taskValues[getCurrentTask()?.id] ?? 0;


  // Animation values for card deck
  const position = useRef(new Animated.ValueXY()).current;
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

  // Swipe indicator animations
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
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp',
  });

  const rightIndicatorScale = position.x.interpolate({
    inputRange: [0, screenWidth / 4, screenWidth / 2],
    outputRange: [0.8, 1, 1.2],
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
        // Swipe right - submit
        handleSubmit();
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

  const handleSubmit = () => {
    setCompletedTasks(prev => prev + 1);
    nextCard('right');
  };

  const handleSkip = () => {
    nextCard('left');
  };

  const nextCard = (direction: 'left' | 'right') => {
    const exitX = direction === 'right' ? screenWidth : -screenWidth;
    
    Animated.timing(position, {
      toValue: { x: exitX, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentCardIndex(prev => prev + 1);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const renderInput = (task: any) => {
    const currentValue = taskValues[task.id] ?? task.value;
    
    switch (task.inputType) {
      case 'numeric':
        return (
          <View style={styles.numericInput}>
            <Text style={styles.inputLabel}>Amount ({task.unit})</Text>
            <View style={styles.numericDisplay}>
              <Text style={styles.numericValue}>{currentValue}</Text>
            </View>
            <View style={styles.numericButtons}>
              <TouchableOpacity 
                style={[styles.numericButton, styles.buttonShadow]}
                onPress={() => updateTaskValue(task.id, Math.max(0, currentValue - 10))}
              >
                <Text style={styles.numericButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.numericButton, styles.buttonShadow]}
                onPress={() => updateTaskValue(task.id, currentValue + 10)}
              >
                <Text style={styles.numericButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'slider':
        return (
          <View style={styles.sliderInput}>
            <Text style={styles.inputLabel}>Select option</Text>
            <View style={styles.sliderOptions}>
              {task.options.map((option: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sliderOption,
                    currentValue === index && styles.sliderOptionSelected
                  ]}
                  onPress={() => updateTaskValue(task.id, index)}
                >
                  <Text style={[
                    styles.sliderOptionText,
                    currentValue === index && styles.sliderOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'yesno':
        return (
          <View style={styles.yesNoInput}>
            <TouchableOpacity 
              style={[styles.noButton, styles.buttonShadow, !currentValue && styles.buttonSelected]}
              onPress={() => updateTaskValue(task.id, false)}
            >
              <Text style={[
                styles.noButtonText,
                !currentValue && styles.buttonTextSelected
              ]}>
                No
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.yesButton, styles.buttonShadow, currentValue && styles.buttonSelected]}
              onPress={() => updateTaskValue(task.id, true)}
            >
              <Text style={[
                styles.yesButtonText,
                currentValue && styles.buttonTextSelected
              ]}>
                Yes
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderCard = (task: any, index: number, relativeIndex: number) => {
    const isTopCard = relativeIndex === 0;
    
    // Calculate scale for inactive cards (gentler scaling)
    const scaleFactor = isTopCard ? 1 : Math.max(0.95 - (relativeIndex * 0.03), 0.7);

    const cardStyle = [
      styles.card,
      isTopCard && styles.topCard,
    ];

    return (
      <Animated.View
        key={task.id}
        style={[
          cardStyle,
          {
            bottom: isTopCard ? 160 : 175 + (relativeIndex * 25), // Stack cards even more aggressively
            zIndex: isTopCard ? 10 : 10 - relativeIndex, // Higher zIndex for cards closer to front
            transform: [
              { translateX: isTopCard ? position.x : 0 },
              { translateY: isTopCard ? position.y : 0 }, // Only swipe animation for active card
              { rotate: isTopCard ? rotate : '0deg' },
              { scale: scaleFactor }, // Apply proportional scaling
            ],
          },
          isTopCard && {
            backgroundColor: cardBackgroundColor,
          },
        ]}
        {...(isTopCard ? panResponder.panHandlers : {})}
      >

        {/* Card content */}
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>{task.icon}</Text>
          </View>
          
          <Text style={styles.cardTitle}>{task.title}</Text>
          <Text style={styles.cardDescription}>{task.description}</Text>
          
          {renderInput(task)}
        </View>
      </Animated.View>
    );
  };

  // Check if all tasks are completed
  const allTasksCompleted = currentCardIndex >= dailyTasks.length;

  return (
    <View style={styles.container}>
      {/* Header with streak and progress */}
      <View style={styles.header}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
        <View style={styles.progressContainer}>
          <ProgressBar 
            current={completedTasks} 
            total={totalTasks}
            showText={true}
            height={16}
          />
        </View>
      </View>

      {/* Current Pet Info */}
      {currentPet && (
        <View style={styles.petInfo}>
          <Text style={styles.petName}>Today's tasks for {currentPet.name}</Text>
        </View>
      )}

      {/* Card Deck */}
      <View style={styles.cardDeck}>
        {allTasksCompleted ? (
          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>All tasks completed!</Text>
            <Text style={styles.completionDescription}>
              Great job taking care of {currentPet?.name || 'your cat'} today!
            </Text>
            <Text style={styles.completionSubtext}>
              Come back tomorrow for your next daily check-in! 🐱
            </Text>
          </View>
        ) : (
          <>
            {/* Swipe Indicators */}
            <Animated.View 
              style={[
                styles.swipeIndicator,
                styles.leftIndicator,
                {
                  opacity: leftIndicatorOpacity,
                  transform: [{ scale: leftIndicatorScale }],
                }
              ]}
            >
              <Text style={styles.leftIndicatorText}>SKIP</Text>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.swipeIndicator,
                styles.rightIndicator,
                {
                  opacity: rightIndicatorOpacity,
                  transform: [{ scale: rightIndicatorScale }],
                }
              ]}
            >
              <Text style={styles.swipeIndicatorText}>SUBMIT</Text>
            </Animated.View>

            {dailyTasks
              .map((task, index) => ({ task, index }))
              .filter(({ index }) => index >= currentCardIndex)
              .slice(0, 3) // Only show next 2 cards (3 cards total: active + 2 behind)
              .map(({ task, index }, relativeIndex) => renderCard(task, index, relativeIndex))}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  streakContainer: {
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  streakNumber: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
  },
  streakLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flex: 1,
  },
  petInfo: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  petName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  cardDeck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: SPACING.lg,
    position: 'relative',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 20,
    zIndex: 11,
  },
  leftIndicator: {
    left: 20,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rightIndicator: {
    right: 20,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  swipeIndicatorText: {
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.surface,
  },
  leftIndicatorText: {
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topCard: {
    zIndex: 2,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  cardIconText: {
    fontSize: 40,
  },
  cardTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  cardDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  // Input styles
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  // Numeric input
  numericInput: {
    alignItems: 'center',
    width: '100%',
  },
  numericDisplay: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minWidth: 120,
  },
  numericValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    textAlign: 'center',
  },
  numericButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  numericButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericButtonText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.surface,
  },
  // Slider input
  sliderInput: {
    width: '100%',
  },
  sliderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  sliderOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sliderOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sliderOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  sliderOptionTextSelected: {
    color: COLORS.surface,
  },
  // Yes/No input
  yesNoInput: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  yesButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
  },
  noButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonSelected: {
    transform: [{ scale: 1.1 }],
  },
  yesButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  noButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  buttonTextSelected: {
    fontWeight: '700',
  },
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  skipButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    minWidth: 120,
  },
  skipButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    minWidth: 120,
  },
  submitButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Completion screen
  completionContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
    backgroundColor: COLORS.success + '10',
    borderRadius: 20,
    width: '100%',
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  completionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.success,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  completionDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  completionSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default TasksScreen;

