import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants';
import ProgressBar from '../components/ProgressBar';
import CardDeck from '../components/CardDeck';
import WheelPicker from '../components/WheelPicker';
import { UserTask } from '../types';
import { getTaskById, getTaskByOldId, TaskDefinition, TaskField } from '../constants/tasks';
import TaskIcon, { 
  PoopSolidIcon, 
  PoopRunnyIcon, 
  PoopPalletIcon,
  PawLeftIcon,
  PawRightIcon,
} from '../components/TaskIcon';
import TaskReminderService from '../services/TaskReminderService';

const TasksScreen: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { 
    currentPet, 
    pets, 
    userTasks, 
    getCurrentStreak, 
    incrementStreak,
    taskReminderState,
    markTaskAsShown,
    markTaskAsCompleted,
    setTaskFrequency,
    getTaskFrequency,
  } = useAppStore();
  
  // Responsive card dimensions
  const CARD_WIDTH = Math.min(screenWidth * 0.9, 400);
  const CARD_HEIGHT = Math.min(screenHeight * 0.65, 600);
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);
  const [selectedTaskForFrequency, setSelectedTaskForFrequency] = useState<TaskDefinition | null>(null);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  
  // Store task values as { taskId: { fieldId: value } }
  const [taskValues, setTaskValues] = useState<{[taskId: string]: {[fieldId: string]: any}}>(() => {
    const initialValues: {[taskId: string]: {[fieldId: string]: any}} = {};
    return initialValues;
  });

  // Convert user tasks to task definitions
  const convertUserTaskToDefinition = (userTask: UserTask): TaskDefinition | null => {
    // Try to get task by old ID first (for backward compatibility)
    let taskDef = getTaskByOldId(userTask.id);
    
    // If not found, try by new ID
    if (!taskDef) {
      taskDef = getTaskById(userTask.id);
    }
    
    // If still not found, return null (skip this task)
    return taskDef || null;
  };

  // Track which tasks have been marked as shown to avoid duplicate calls
  const markedTasksRef = useRef<Set<string>>(new Set());

  // Get daily tasks from user's selection, filtered by what should appear today
  const dailyTasks = useMemo(() => {
    if (!userTasks || !currentPet) {
      return [];
    }

    // Get all tasks that should be shown today (daily, weekly, monthly combined)
    // We need to check custom frequencies and filter accordingly
    const allUserTasks = [
      ...userTasks.daily,
      ...userTasks.weekly,
      ...userTasks.monthly,
    ];

    // Filter tasks based on their actual frequency (custom or default)
    const tasksForToday = allUserTasks.filter((userTask) => {
      const taskDef = getTaskByOldId(userTask.id) || getTaskById(userTask.id);
      if (!taskDef) return false;

      // Get the actual frequency (custom or default) - pass directly to TaskReminderService
      const customFrequency = getTaskFrequency(currentPet.id, userTask.id);
      
      // Check if task should be shown today based on its actual frequency
      return TaskReminderService.shouldShowTaskToday(
        userTask,
        taskReminderState,
        new Date(),
        customFrequency
      );
    });

    // Convert to task definitions
    const taskDefinitions = tasksForToday
      .map(convertUserTaskToDefinition)
      .filter((task): task is TaskDefinition => task !== null);

    return taskDefinitions;
  }, [userTasks, taskReminderState, currentPet, getTaskFrequency]);

  // Mark tasks as shown when they're displayed (useEffect to avoid render-time state updates)
  useEffect(() => {
    dailyTasks.forEach((task) => {
      if (!markedTasksRef.current.has(task.id)) {
        markTaskAsShown(task.id);
        markedTasksRef.current.add(task.id);
      }
    });
  }, [dailyTasks, markTaskAsShown]);

  // Reset completed tasks counter when tasks change
  useEffect(() => {
    setCompletedTasks(0);
    setCurrentCardIndex(0);
    // Reset task values when tasks change
    setTaskValues({});
  }, [dailyTasks.length]);

  // Get real streak data for current pet
  const streak = currentPet ? getCurrentStreak(currentPet.id) : 0;
  const totalTasks = dailyTasks.length;

  // Helper functions to update task values
  const updateTaskFieldValue = (taskId: string, fieldId: string, value: any) => {
    setTaskValues(prev => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [fieldId]: value,
      },
    }));
  };

  const getTaskFieldValue = (taskId: string, fieldId: string): any => {
    return taskValues[taskId]?.[fieldId];
  };

  const getCurrentTask = (): TaskDefinition | undefined => {
    return dailyTasks[currentCardIndex];
  };

  // Check if task is complete (all required fields filled)
  const isTaskComplete = (task: TaskDefinition): boolean => {
    return task.fields.every(field => {
      const value = getTaskFieldValue(task.id, field.id);
      // Boolean fields can be false, so check for undefined/null
      if (field.type === 'boolean') {
        return value !== undefined && value !== null;
      }
      // Text fields need non-empty string
      if (field.type === 'text') {
        return value !== undefined && value !== null && value !== '';
      }
      // Other fields just need to be defined
      return value !== undefined && value !== null;
    });
  };



  const handleNext = () => {
    const currentTask = getCurrentTask();
    if (currentTask && isTaskComplete(currentTask)) {
      // Mark task as completed
      markTaskAsCompleted(currentTask.id);
      setCompletedTasks(prev => prev + 1);
      
      if (currentCardIndex < dailyTasks.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // Last task - complete the flow
        if (currentPet) {
          incrementStreak(currentPet.id);
        }
        setCurrentCardIndex(dailyTasks.length);
      }
    }
  };

  const handleSkip = () => {
    if (currentCardIndex < dailyTasks.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Last task skipped - complete the flow
      if (currentPet) {
        incrementStreak(currentPet.id);
      }
      setCurrentCardIndex(dailyTasks.length);
    }
  };

  const handleGoBack = () => {
    if (currentCardIndex > 0) {
      const previousIndex = currentCardIndex - 1;
      setCurrentCardIndex(previousIndex);
      // Decrement completed tasks if we're going back past a completed task
      if (completedTasks > 0) {
        setCompletedTasks(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleComplete = () => {
    // This is called when all tasks are done
    // Increment streak for current pet
    if (currentPet) {
      incrementStreak(currentPet.id);
    }
    // Mark all tasks as completed by setting index beyond the array
    setCurrentCardIndex(dailyTasks.length);
  };

  // Render a single field input
  const renderFieldInput = (task: TaskDefinition, field: TaskField) => {
    const fieldValue = getTaskFieldValue(task.id, field.id);
    const catName = currentPet?.name || 'your cat';

    switch (field.type) {
      case 'boolean':
        // For multi-field tasks, show boolean as selectable buttons
        // For single boolean tasks, handled by card buttons
        const isMultiFieldTask = task.fields.length > 1;
        if (!isMultiFieldTask) {
          return null; // Handled by card buttons
        }
        
        // Render boolean as Yes/No buttons for multi-field tasks
        return (
          <View style={styles.booleanInputContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.booleanOptions}>
              <TouchableOpacity
                style={[
                  styles.booleanOption,
                  fieldValue === true && styles.booleanOptionSelected
                ]}
                onPress={() => updateTaskFieldValue(task.id, field.id, true)}
              >
                <Text style={[
                  styles.booleanOptionText,
                  fieldValue === true && styles.booleanOptionTextSelected
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.booleanOption,
                  fieldValue === false && styles.booleanOptionSelected
                ]}
                onPress={() => updateTaskFieldValue(task.id, field.id, false)}
              >
                <Text style={[
                  styles.booleanOptionText,
                  fieldValue === false && styles.booleanOptionTextSelected
                ]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'text':
        return (
          <View style={styles.textInputContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              style={styles.textInputField}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              placeholderTextColor={COLORS.textSecondary}
              value={fieldValue || ''}
              onChangeText={(text) => updateTaskFieldValue(task.id, field.id, text)}
            />
          </View>
        );

      case 'radio':
        return (
          <View style={styles.radioInputContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.radioOptions}>
              {field.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.radioOption,
                    fieldValue === option.value && styles.radioOptionSelected
                  ]}
                  onPress={() => updateTaskFieldValue(task.id, field.id, option.value)}
                >
                  <Text style={[
                    styles.radioOptionText,
                    fieldValue === option.value && styles.radioOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'scale':
        const scale = field.scale!;
        const min = scale.min;
        const max = scale.max;
        const labels = scale.labels || {};
        
        return (
          <View style={styles.scaleInputContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.scaleOptions}>
              {Array.from({ length: max - min + 1 }, (_, i) => {
                const value = min + i;
                const label = labels[value.toString()] || value.toString();
                const isSelected = fieldValue === value;
                const description = getScaleDescription(task.id, field.id, value);
                
                return (
                  <View key={value} style={styles.scaleOptionWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.scaleOption,
                        isSelected && styles.scaleOptionSelected
                      ]}
                      onPress={() => updateTaskFieldValue(task.id, field.id, value)}
                    >
                      <Text style={[
                        styles.scaleOptionText,
                        isSelected && styles.scaleOptionTextSelected
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                    {description && (
                      <Text style={styles.scaleOptionDescription}>
                        {description}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );

      case 'choices':
        return (
          <View style={styles.choicesInputContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.choicesOptions}>
              {field.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.choiceOption,
                    fieldValue === option.value && styles.choiceOptionSelected
                  ]}
                  onPress={() => updateTaskFieldValue(task.id, field.id, option.value)}
                >
                  <Text style={[
                    styles.choiceOptionText,
                    fieldValue === option.value && styles.choiceOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'date':
        // For MVP, we'll use a simple text input or show current date
        // In production, you'd use a proper date picker
        const hasDateValue = fieldValue !== undefined && fieldValue !== null;
        const dateValue = hasDateValue 
          ? new Date(fieldValue).toLocaleDateString() 
          : new Date().toLocaleDateString();
        return (
          <View style={styles.dateInputContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TouchableOpacity
              style={[
                styles.dateDisplay,
                hasDateValue && styles.dateDisplaySelected
              ]}
              onPress={() => {
                // Set to today's date for MVP
                updateTaskFieldValue(task.id, field.id, new Date().toISOString());
              }}
            >
              <Text style={[
                styles.dateDisplayText,
                hasDateValue && styles.dateDisplayTextSelected
              ]}>
                {dateValue}
              </Text>
              <Text style={[
                styles.dateDisplayHint,
                hasDateValue && styles.dateDisplayHintSelected
              ]}>
                {hasDateValue ? 'Date set ✓' : 'Tap to set today'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'object':
        // For object types (like nail clipping paws)
        if (field.schema) {
          const objectValue = fieldValue || {};
          const isPawsField = task.id === 'nail-clipping' && field.id === 'paws';
          
          // Helper to get the appropriate paw icon
          const getPawIcon = (key: string, isSelected: boolean) => {
            const iconSize = 32;
            const isLeft = key.includes('Left');
            const Icon = isLeft ? PawLeftIcon : PawRightIcon;
            return <Icon width={iconSize} height={iconSize} />;
          };
          
          return (
            <View style={styles.objectInputContainer}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {field.help && (
                <Text style={styles.fieldHelp}>{field.help}</Text>
              )}
              {isPawsField ? (
                // Special layout for nail clipping paws - 2x2 grid
                <View style={styles.pawsGrid}>
                  <View style={styles.pawsRow}>
                    {['frontLeft', 'frontRight'].map((key) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.pawButton,
                          objectValue[key] && styles.pawButtonSelected
                        ]}
                        onPress={() => {
                          updateTaskFieldValue(task.id, field.id, {
                            ...objectValue,
                            [key]: !objectValue[key],
                          });
                        }}
                      >
                        {getPawIcon(key, objectValue[key])}
                        <Text style={[
                          styles.pawLabel,
                          objectValue[key] && styles.pawLabelSelected
                        ]}>
                          {key.includes('Left') ? 'Front L' : 'Front R'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.pawsRow}>
                    {['backLeft', 'backRight'].map((key) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.pawButton,
                          objectValue[key] && styles.pawButtonSelected
                        ]}
                        onPress={() => {
                          updateTaskFieldValue(task.id, field.id, {
                            ...objectValue,
                            [key]: !objectValue[key],
                          });
                        }}
                      >
                        {getPawIcon(key, objectValue[key])}
                        <Text style={[
                          styles.pawLabel,
                          objectValue[key] && styles.pawLabelSelected
                        ]}>
                          {key.includes('Left') ? 'Back L' : 'Back R'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.objectFields}>
                  {Object.keys(field.schema).map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.objectField,
                        objectValue[key] && styles.objectFieldSelected
                      ]}
                      onPress={() => {
                        updateTaskFieldValue(task.id, field.id, {
                          ...objectValue,
                          [key]: !objectValue[key],
                        });
                      }}
                    >
                      <Text style={[
                        styles.objectFieldText,
                        objectValue[key] && styles.objectFieldTextSelected
                      ]}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      {objectValue[key] && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // Render all inputs for a task
  const renderTaskInputs = (task: TaskDefinition) => {
    const catName = currentPet?.name || 'your cat';
    const question = task.question.replace('{catName}', catName);
    
    return (
      <ScrollView 
        style={styles.inputsScrollView}
        contentContainerStyle={styles.inputsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {task.fields.map((field, index) => (
          <View key={field.id} style={styles.fieldContainer}>
            {renderFieldInput(task, field)}
          </View>
        ))}
      </ScrollView>
    );
  };

  // Get fun fact for specific tasks
  const getFunFact = (taskId: string): string | null => {
    const funFacts: { [key: string]: string } = {
      'pee-frequency': 'Most healthy adult cats urinate 2–4 times a day.',
      'sleeping-resp-rate': 'A healthy cat breathes 20 - 30 times per minute during sleep. Tracking this helps spot early signs of heart problems.',
    };
    return funFacts[taskId] || null;
  };

  // Get scale description for specific task/field combinations
  const getScaleDescription = (taskId: string, fieldId: string, value: number): string | null => {
    // Activity/activeness scale (1-5)
    if (taskId === 'playtime' && fieldId === 'activeness') {
      const descriptions: { [key: number]: string } = {
        1: 'Very lazy',
        2: 'Lazy',
        3: 'Normal',
        4: 'Active',
        5: 'Super energetic',
      };
      return descriptions[value] || '';
    }
    
    // Poop consistency scale (1-5)
    if (taskId === 'poop' && fieldId === 'consistency') {
      const descriptions: { [key: number]: string } = {
        1: 'Very hard',
        2: 'Dry',
        3: 'Normal',
        4: 'Wet',
        5: 'Watery diarrhoea',
      };
      return descriptions[value] || '';
    }
    
    return null;
  };

  // Convert TaskFrequency to number + period (handles both old string format and new object format)
  const convertFromFrequency = (frequency: 'daily' | 'weekly' | 'monthly' | { number: number; period: 'day' | 'week' | 'month' } | null): { number: number; period: 'day' | 'week' | 'month' } => {
    if (!frequency) {
      return { number: 1, period: 'day' };
    }
    if (typeof frequency === 'object') {
      return frequency;
    }
    // Handle old string format
    switch (frequency) {
      case 'daily':
        return { number: 1, period: 'day' };
      case 'weekly':
        return { number: 1, period: 'week' };
      case 'monthly':
        return { number: 1, period: 'month' };
    }
  };

  const handleFrequencyChange = () => {
    if (selectedTaskForFrequency && currentPet) {
      // Store the custom frequency as an object with number + period
      const customFrequency: { number: number; period: 'day' | 'week' | 'month' } = {
        number: selectedNumber,
        period: selectedPeriod,
      };
      setTaskFrequency(currentPet.id, selectedTaskForFrequency.id, customFrequency);
      setFrequencyModalVisible(false);
      setSelectedTaskForFrequency(null);
    }
  };

  // Initialize picker values when modal opens
  useEffect(() => {
    if (selectedTaskForFrequency && frequencyModalVisible) {
      const currentFreq = getCurrentFrequency(selectedTaskForFrequency);
      const { number, period } = convertFromFrequency(currentFreq);
      setSelectedNumber(number);
      setSelectedPeriod(period);
    }
  }, [selectedTaskForFrequency?.id, frequencyModalVisible]);

  const getCurrentFrequency = (task: TaskDefinition): 'daily' | 'weekly' | 'monthly' | { number: number; period: 'day' | 'week' | 'month' } => {
    if (!currentPet) return task.recurringCycle || 'daily';
    const customFrequency = getTaskFrequency(currentPet.id, task.id);
    return customFrequency || task.recurringCycle || 'daily';
  };

  const renderCardForDeck = (task: TaskDefinition, index: number, relativeIndex: number, isTopCard: boolean) => {
    const catName = currentPet?.name || 'your cat';
    const question = task.question.replace('{catName}', catName);
    const funFact = getFunFact(task.id);
    
    // Check if this is a simple boolean-only task
    const isSimpleBoolean = task.fields.length === 1 && task.fields[0].type === 'boolean';
    
    // Calculate icon size (64% of card width)
    const iconSize = Math.round(CARD_WIDTH * 0.5);
    
    // Special case: nail-clipping doesn't show hero icon
    const showHeroIcon = task.id !== 'nail-clipping';
    
    // Render the hero icon section
    const renderHeroIcon = () => {
      if (!showHeroIcon) return null;
      
      // Special case: poop card shows all 3 poop icons inline
      if (task.id === 'poop') {
        const poopIconSize = Math.round(iconSize * 0.45);
        return (
          <View style={styles.poopIconsContainer}>
            <PoopRunnyIcon width={poopIconSize} height={poopIconSize} />
            <PoopSolidIcon width={poopIconSize} height={poopIconSize} />
            <PoopPalletIcon width={poopIconSize} height={poopIconSize} />
          </View>
        );
      }
      
      return <TaskIcon taskId={task.id} size={iconSize} />;
    };
    
    return (
      <View style={styles.cardContent}>
        {/* Go back button - only on top card and not on first card */}
        {isTopCard && currentCardIndex > 0 && (
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={handleGoBack}
          >
            <Text style={styles.goBackButtonText}>← go back</Text>
          </TouchableOpacity>
        )}
        
        {/* Frequency button - only on top card */}
        {isTopCard && (
          <TouchableOpacity
            style={styles.frequencyButton}
            onPress={() => {
              setSelectedTaskForFrequency(task);
              setFrequencyModalVisible(true);
            }}
          >
            <Text style={styles.frequencyButtonText}>⚙️</Text>
          </TouchableOpacity>
        )}
        
        {/* Title first */}
        <Text style={styles.cardTitle}>{question}</Text>
        
        {/* Hero icon (swapped to be after title) */}
        <View style={styles.cardIcon}>
          {renderHeroIcon()}
        </View>
        
        {/* Render inputs for non-simple-boolean tasks */}
        {!isSimpleBoolean && renderTaskInputs(task)}
        
        {/* Fun fact section */}
        {funFact && (
          <View style={styles.funFactContainer}>
            <Text style={styles.funFactLabel}>Did you know?</Text>
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>
        )}
      </View>
    );
  };

  // Check if all tasks are completed (only if there are tasks)
  const allTasksCompleted = dailyTasks.length > 0 && currentCardIndex >= dailyTasks.length;
  const hasNoPets = !currentPet;
  const hasNoTasks = dailyTasks.length === 0;

  return (
    <View style={styles.container}>
      {/* Header with streak and progress */}
      <View style={styles.header}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
        {totalTasks > 0 && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              current={completedTasks} 
              total={totalTasks}
              showText={true}
              height={16}
            />
          </View>
        )}
      </View>

      {/* Card Deck */}
      <View style={styles.cardDeck}>
        {hasNoPets ? (
          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>🐱</Text>
            <Text style={styles.completionTitle}>No pet selected</Text>
            <Text style={styles.completionDescription}>
              Please add a pet in your profile to start tracking tasks.
            </Text>
            <Text style={styles.completionSubtext}>
              Go to Pet Profiles to add your first cat! 🐾
            </Text>
          </View>
        ) : hasNoTasks ? (
          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>📋</Text>
            <Text style={styles.completionTitle}>No tasks to complete</Text>
            <Text style={styles.completionDescription}>
              You haven't selected any tasks to track for {currentPet?.name || 'your cat'} yet.
            </Text>
            <Text style={styles.completionSubtext}>
              Complete onboarding to set up your daily tasks! ✨
            </Text>
          </View>
        ) : allTasksCompleted ? (
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
            primaryButtonText={
              (() => {
                const task = getCurrentTask();
                if (!task) return 'Next';
                const isSimpleBoolean = task.fields.length === 1 && task.fields[0].type === 'boolean';
                if (isSimpleBoolean) {
                  // For boolean-only tasks, always show "Yes" even on last card
                  return 'Yes';
                }
                if (currentCardIndex === dailyTasks.length - 1) return 'Submit';
                return 'Next';
              })()
            }
            primaryButtonDisabled={
              (() => {
                const task = getCurrentTask();
                if (!task) return false;
                const isSimpleBoolean = task.fields.length === 1 && task.fields[0].type === 'boolean';
                // For simple boolean tasks, button is always enabled
                if (isSimpleBoolean) return false;
                // For other tasks, disable if not complete
                return !isTaskComplete(task);
              })()
            }
            secondaryButtonText={
              (() => {
                const task = getCurrentTask();
                if (!task) return 'Skip';
                const isSimpleBoolean = task.fields.length === 1 && task.fields[0].type === 'boolean';
                if (isSimpleBoolean) {
                  // For boolean-only tasks, always show "No" even on last card
                  return 'No';
                }
                return 'Skip';
              })()
            }
            onPrimaryAction={(item, index) => {
              const task = item as TaskDefinition;
              const isSimpleBoolean = task.fields.length === 1 && task.fields[0].type === 'boolean';
              
              if (isSimpleBoolean) {
                // Set boolean field to true
                updateTaskFieldValue(task.id, task.fields[0].id, true);
                // Mark task as completed
                markTaskAsCompleted(task.id);
                setCompletedTasks(prev => prev + 1);
                
                if (index < dailyTasks.length - 1) {
                  setCurrentCardIndex(prev => prev + 1);
                } else {
                  // Last task - complete the flow
                  if (currentPet) {
                    incrementStreak(currentPet.id);
                  }
                  setCurrentCardIndex(dailyTasks.length);
                }
              } else {
                // Check if task is complete before proceeding
                if (isTaskComplete(task)) {
                  handleNext();
                }
              }
            }}
            onSecondaryAction={(item, index) => {
              const task = item as TaskDefinition;
              const isSimpleBoolean = task.fields.length === 1 && task.fields[0].type === 'boolean';
              
              if (isSimpleBoolean) {
                // Set boolean field to false
                updateTaskFieldValue(task.id, task.fields[0].id, false);
                // Mark task as completed (even if "No")
                markTaskAsCompleted(task.id);
                setCompletedTasks(prev => prev + 1);
                
                if (index < dailyTasks.length - 1) {
                  setCurrentCardIndex(prev => prev + 1);
                } else {
                  // Last task - complete the flow
                  if (currentPet) {
                    incrementStreak(currentPet.id);
                  }
                  setCurrentCardIndex(dailyTasks.length);
                }
              } else {
                // Skip task (don't mark as completed)
                handleSkip();
              }
            }}
          />
        )}
      </View>

      {/* Frequency Selection Modal */}
      <Modal
        visible={frequencyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setFrequencyModalVisible(false);
          setSelectedTaskForFrequency(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>This card pops up every:</Text>
            {selectedTaskForFrequency && (
              <>
                <View style={styles.pickerContainer}>
                  {/* Shared floating selection bar - rendered first so it's behind */}
                  <View style={styles.sharedSelectionBar} pointerEvents="none" />
                  
                  <View style={styles.pickerColumn}>
                    <WheelPicker
                      key={`number-${selectedPeriod}-${frequencyModalVisible}`}
                      items={Array.from({ length: selectedPeriod === 'day' ? 30 : 12 }, (_, i) => ({
                        label: (i + 1).toString(),
                        value: i + 1,
                      }))}
                      selectedIndex={Math.min(selectedNumber - 1, (selectedPeriod === 'day' ? 30 : 12) - 1)}
                      onSelectionChange={(index) => setSelectedNumber(index + 1)}
                      width={100}
                      showSelectionIndicator={false}
                    />
                  </View>
                  <View style={styles.pickerColumn}>
                    <WheelPicker
                      key={`period-${frequencyModalVisible}`}
                      items={[
                        { label: 'day(s)', value: 0 },
                        { label: 'week(s)', value: 1 },
                        { label: 'month(s)', value: 2 },
                      ]}
                      selectedIndex={selectedPeriod === 'day' ? 0 : selectedPeriod === 'week' ? 1 : 2}
                      onSelectionChange={(index) => {
                        const periods: ('day' | 'week' | 'month')[] = ['day', 'week', 'month'];
                        const newPeriod = periods[index];
                        setSelectedPeriod(newPeriod);
                        // Adjust number range based on period
                        const maxNumber = newPeriod === 'day' ? 30 : 12;
                        if (selectedNumber > maxNumber) {
                          setSelectedNumber(maxNumber);
                        }
                      }}
                      width={120}
                      showSelectionIndicator={false}
                    />
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setFrequencyModalVisible(false);
                      setSelectedTaskForFrequency(null);
                    }}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={handleFrequencyChange}
                  >
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    width: '100%',
  },
  cardContent: {
    paddingTop: 56, // Extra space for go back and config buttons
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  cardIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  poopIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: 28,
  },
  funFactContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    width: '100%',
  },
  funFactLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  funFactText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
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
  // New input styles
  inputsScrollView: {
    width: '100%',
    flex: 1,
    maxHeight: 400,
  },
  inputsScrollContent: {
    paddingVertical: SPACING.sm,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
    width: '100%',
  },
  fieldLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  fieldHelp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Text input
  textInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  textInputField: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Radio input
  radioInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  radioOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  radioOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
  },
  radioOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  radioOptionTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  // Scale input
  scaleInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scaleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  scaleOptionWrapper: {
    alignItems: 'center',
    width: 40,
  },
  scaleOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  scaleOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  scaleOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  scaleOptionTextSelected: {
    color: COLORS.surface,
  },
  scaleOptionDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 8,
    marginTop: SPACING.xs,
    lineHeight: 10,
    width: 40,
  },
  // Choices input
  choicesInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  choicesOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  choiceOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
  },
  choiceOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  choiceOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  choiceOptionTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  // Date input
  dateInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dateDisplay: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateDisplaySelected: {
    backgroundColor: COLORS.primary + '10', // 10% opacity
    borderColor: COLORS.primary,
  },
  dateDisplayText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dateDisplayTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dateDisplayHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  dateDisplayHintSelected: {
    color: COLORS.primary,
    fontStyle: 'normal',
  },
  // Object input
  objectInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  objectFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  objectField: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    minWidth: 100,
  },
  objectFieldSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  objectFieldText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  objectFieldTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  // Paws grid for nail clipping
  pawsGrid: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.md,
  },
  pawsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  pawButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 90,
  },
  pawButtonSelected: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  pawLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  pawLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  // Boolean input (for multi-field tasks)
  booleanInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  booleanOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  booleanOption: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
  },
  booleanOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  booleanOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  booleanOptionTextSelected: {
    color: COLORS.surface,
  },
  // Go back button
  goBackButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 10,
  },
  goBackButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  // Frequency button
  frequencyButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 10,
  },
  frequencyButtonText: {
    fontSize: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 200,
    marginVertical: SPACING.xl,
    gap: SPACING.md,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  sharedSelectionBar: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    height: 40,
    top: '50%',
    marginTop: -20, // No labels in this picker, so center it properly
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 0, // Same level, but behind due to render order
    ...SHADOWS.small,
  },
});

export default TasksScreen;

