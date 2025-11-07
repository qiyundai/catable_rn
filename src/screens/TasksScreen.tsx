import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import ProgressBar from '../components/ProgressBar';
import CardDeck from '../components/CardDeck';
import WheelPicker from '../components/WheelPicker';
import { UserTask } from '../types';
import { getTaskById, getTaskByOldId, TaskDefinition, TaskField } from '../constants/tasks';
import TaskReminderService from '../services/TaskReminderService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75; // 75% of screen width
const CARD_HEIGHT = screenHeight * 0.5; // 50% of screen height

const TasksScreen: React.FC = () => {
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

      // Get the actual frequency (custom or default)
      const actualFrequency = getTaskFrequency(currentPet.id, userTask.id) || taskDef.recurringCycle || 'daily';
      
      // Check if task should be shown today based on its actual frequency
      return TaskReminderService.shouldShowTaskToday(
        { ...userTask, recurringCycle: actualFrequency },
        taskReminderState
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
                
                return (
                  <TouchableOpacity
                    key={value}
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
          return (
            <View style={styles.objectInputContainer}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {field.help && (
                <Text style={styles.fieldHelp}>{field.help}</Text>
              )}
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

  // Convert number + period to frequency
  const convertToFrequency = (number: number, period: 'day' | 'week' | 'month'): 'daily' | 'weekly' | 'monthly' => {
    if (period === 'day' && number === 1) return 'daily';
    if (period === 'week' && number === 1) return 'weekly';
    if (period === 'month' && number === 1) return 'monthly';
    // For now, map to closest standard frequency
    if (period === 'day') return 'daily';
    if (period === 'week') return 'weekly';
    return 'monthly';
  };

  // Convert frequency to number + period
  const convertFromFrequency = (frequency: 'daily' | 'weekly' | 'monthly'): { number: number; period: 'day' | 'week' | 'month' } => {
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
      const frequency = convertToFrequency(selectedNumber, selectedPeriod);
      setTaskFrequency(currentPet.id, selectedTaskForFrequency.id, frequency);
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

  const getCurrentFrequency = (task: TaskDefinition): 'daily' | 'weekly' | 'monthly' => {
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
        
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{task.icon || '📝'}</Text>
        </View>
        
        {/* Use question as the title */}
        <Text style={styles.cardTitle}>{question}</Text>
        
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
    paddingBottom: SPACING.xl + 80, // Extra padding for buttons (60px button height + 20px spacing)
    alignItems: 'center',
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
    marginBottom: SPACING.xl,
    lineHeight: 28,
  },
  funFactContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
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
    maxHeight: 300,
  },
  inputsScrollContent: {
    paddingVertical: SPACING.md,
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
    gap: SPACING.sm,
    width: '100%',
  },
  scaleOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
  },
  scaleOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  scaleOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  scaleOptionTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
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
  },
  pickerColumn: {
    flex: 1,
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
});

export default TasksScreen;

