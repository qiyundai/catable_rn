import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import ProgressBar from '../components/ProgressBar';
import CardDeck from '../components/CardDeck';
import { UserTask } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75; // 75% of screen width
const CARD_HEIGHT = screenHeight * 0.5; // 50% of screen height

const TasksScreen: React.FC = () => {
  const { currentPet, pets, userTasks, getCurrentStreak, incrementStreak } = useAppStore();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [taskValues, setTaskValues] = useState<{[key: string]: any}>(() => {
    // Initialize task values based on user's selected tasks
    const initialValues: {[key: string]: any} = {};
    userTasks?.daily?.forEach(task => {
      const taskConfigs: { [key: string]: any } = {
        'feed': false,
        'peeing_frequency': 0,
        'poop_consistency': 2,
        'activity': 2,
        'grooming': false,
      };
      initialValues[task.id] = taskConfigs[task.id] ?? false;
    });
    return initialValues;
  });
  
  // Convert user tasks to card format
  const convertUserTaskToCard = (task: UserTask, index: number) => {
    // Map task IDs to their card configurations
    const taskConfigs: { [key: string]: any } = {
      'feed': {
        title: 'Feeding',
        description: 'Did your cat eat today?',
        icon: '🍽️',
        inputType: 'yesno',
        value: false,
      },
      'peeing_frequency': {
        title: 'Peeing Frequency',
        description: 'How many times did your cat pee today?',
        icon: '💧',
        inputType: 'numeric',
        unit: 'times',
        value: 0,
        increment: 1,
      },
      'poop_consistency': {
        title: 'Poop Consistency',
        description: 'How was your cat\'s poop today?',
        icon: '💩',
        inputType: 'slider',
        options: ['Hard & Dry', 'Firm', 'Normal', 'Soft', 'Watery Diarrhea'],
        value: 2,
      },
      'activity': {
        title: 'Activity Level',
        description: 'How active was your cat today?',
        icon: '🎾',
        inputType: 'slider',
        options: ['Very Lazy', 'Lazy', 'Normal', 'Active', 'Super Energetic'],
        value: 2,
      },
      'grooming': {
        title: 'Grooming',
        description: 'Did you groom your cat today?',
        icon: '🪥',
        inputType: 'yesno',
        value: false,
      },
    };

    const config = taskConfigs[task.id] || {
      title: task.name,
      description: `Track ${task.name.toLowerCase()}`,
      icon: '📝',
      inputType: 'yesno',
      value: false,
    };

    return {
      id: task.id,
      title: config.title,
      description: config.description,
      icon: config.icon,
      type: 'daily',
      inputType: config.inputType,
      unit: config.unit,
      options: config.options,
      value: taskValues[task.id] ?? config.value,
    };
  };

  // Get daily tasks from user's selection, with fallback for incomplete onboarding
  const dailyTasks = userTasks?.daily?.map(convertUserTaskToCard) || [
    {
      id: 'feed',
      title: 'Feeding',
      description: 'Did your cat eat today?',
      icon: '🍽️',
      type: 'daily',
      inputType: 'yesno',
      value: false,
    },
    {
      id: 'activity',
      title: 'Activity Level',
      description: 'How active was your cat today?',
      icon: '🎾',
      type: 'daily',
      inputType: 'slider',
      options: ['Very Lazy', 'Lazy', 'Normal', 'Active', 'Super Energetic'],
      value: 2,
    },
  ];

  // Get real streak data for current pet
  const streak = currentPet ? getCurrentStreak(currentPet.id) : 0;
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



  const handleNext = () => {
    if (currentCardIndex < dailyTasks.length - 1) {
      setCompletedTasks(prev => prev + 1);
      setCurrentCardIndex(prev => prev + 1);
    }
    // If it's the last card, don't increment - let CardDeck handle completion
  };

  const handleSkip = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  const handleComplete = () => {
    // Count the last task as completed
    setCompletedTasks(prev => prev + 1);
    // Increment streak for current pet
    if (currentPet) {
      incrementStreak(currentPet.id);
    }
    // Mark all tasks as completed by setting index beyond the array
    setCurrentCardIndex(dailyTasks.length);
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
                onPress={() => updateTaskValue(task.id, Math.max(0, currentValue - (task.increment || 1)))}
              >
                <Text style={styles.numericButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.numericButton, styles.buttonShadow]}
                onPress={() => updateTaskValue(task.id, currentValue + (task.increment || 1))}
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

  const renderCardForDeck = (task: any, index: number, relativeIndex: number, isTopCard: boolean) => {
    return (
      <View style={styles.cardContent}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{task.icon}</Text>
        </View>
        
        <Text style={styles.cardTitle}>{task.title}</Text>
        <Text style={styles.cardDescription}>{task.description}</Text>
        
        {renderInput(task)}
      </View>
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
          <CardDeck
            items={dailyTasks}
            currentIndex={currentCardIndex}
            onNext={handleNext}
            onSkip={handleSkip}
            onComplete={handleComplete}
            renderCard={renderCardForDeck}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
            maxVisibleCards={3}
            primaryButtonText={currentCardIndex === dailyTasks.length - 1 ? 'Submit' : 'Next'}
            secondaryButtonText="Skip"
          />
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
  leftIndicator: {
    left: 20,
    backgroundColor: COLORS.gray,
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

