import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const TasksScreen: React.FC = () => {
  const { currentPet, pets } = useAppStore();

  // Mock data for demonstration
  const todayTasks = [
    {
      id: '1',
      title: 'Water Intake',
      description: 'How much water did your cat drink today?',
      icon: '💧',
      completed: false,
      type: 'daily',
    },
    {
      id: '2',
      title: 'Feeding',
      description: 'Did your cat eat today?',
      icon: '🍽️',
      completed: true,
      type: 'daily',
    },
    {
      id: '3',
      title: 'Playtime Activity',
      description: 'How active was your cat today?',
      icon: '🎾',
      completed: false,
      type: 'daily',
    },
    {
      id: '4',
      title: 'Poop Consistency',
      description: 'How was your cat\'s poop today?',
      icon: '💩',
      completed: false,
      type: 'daily',
    },
    {
      id: '5',
      title: 'Litter Box',
      description: 'Did your cat use the litter box?',
      icon: '📦',
      completed: false,
      type: 'daily',
    },
  ];

  const recurringTasks = [
    {
      id: '6',
      title: 'Nail Clipping',
      description: 'Has your cat had their nails clipped this month?',
      icon: '✂️',
      completed: false,
      type: 'recurring',
      dueDate: '2024-01-15',
    },
    {
      id: '7',
      title: 'Vet Check-up',
      description: 'Time for annual check-up',
      icon: '🏥',
      completed: false,
      type: 'recurring',
      dueDate: '2024-02-01',
    },
  ];

  const completedTasks = todayTasks.filter(task => task.completed).length;
  const totalTasks = todayTasks.length;
  const streak = 7; // Mock streak data

  const renderTaskCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={[
      styles.taskCard,
      item.completed && styles.completedTaskCard
    ]}>
      <View style={styles.taskIcon}>
        <Text style={styles.taskIconText}>{item.icon}</Text>
      </View>
      <View style={styles.taskContent}>
        <Text style={[
          styles.taskTitle,
          item.completed && styles.completedTaskTitle
        ]}>
          {item.title}
        </Text>
        <Text style={[
          styles.taskDescription,
          item.completed && styles.completedTaskDescription
        ]}>
          {item.description}
        </Text>
        {item.type === 'recurring' && (
          <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
        )}
      </View>
      <View style={[
        styles.checkbox,
        item.completed && styles.completedCheckbox
      ]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with streak and progress */}
      <View style={styles.header}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedTasks}/{totalTasks} tasks completed
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(completedTasks / totalTasks) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Current Pet Info */}
      {currentPet && (
        <View style={styles.petInfo}>
          <Text style={styles.petName}>Today's tasks for {currentPet.name}</Text>
        </View>
      )}

      {/* Daily Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Tasks</Text>
        <FlatList
          data={todayTasks}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Recurring Tasks */}
      {recurringTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurring Tasks</Text>
          <FlatList
            data={recurringTasks}
            renderItem={renderTaskCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Complete All Button */}
      {completedTasks === totalTasks && (
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={styles.completionTitle}>All tasks completed!</Text>
          <Text style={styles.completionDescription}>
            Great job taking care of {currentPet?.name || 'your cat'} today!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  petInfo: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  petName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completedTaskCard: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  taskIconText: {
    fontSize: 24,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  completedTaskTitle: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  completedTaskDescription: {
    color: COLORS.success,
  },
  dueDate: {
    ...TYPOGRAPHY.small,
    color: COLORS.warning,
    marginTop: SPACING.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCheckbox: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
    backgroundColor: COLORS.success + '10',
    margin: SPACING.lg,
    borderRadius: 12,
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  completionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  completionDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default TasksScreen;
