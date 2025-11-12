import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  LayoutAnimation,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store';
import { Pet } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { TASK_DEFINITIONS, getTaskById, getTaskByOldId, TaskDefinition } from '../constants/tasks';
import TaskReminderService from '../services/TaskReminderService';
import PdfReportService from '../services/PdfReportService';
import { formatPetAge } from '../utils/petUtils';

type PetProfilesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PetProfilesScreen: React.FC = () => {
  const { pets, currentPet, setCurrentPet, userTasks, taskReminderState } = useAppStore();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const navigation = useNavigation<PetProfilesScreenNavigationProp>();


  // Generate real monthly data for the pet based on task completion history
  const generateMonthlyData = (petId: string) => {
    if (!userTasks) {
      return {};
    }

    const data: { [key: string]: string } = {};
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = now.getDate();

    // Helper to get task definition
    const getTaskDef = (taskId: string): TaskDefinition | null => {
      return getTaskByOldId(taskId) || getTaskById(taskId);
    };

    // Process daily tasks
    userTasks.daily.forEach((userTask) => {
      const taskDef = getTaskDef(userTask.id);
      if (!taskDef) return;

      const displayName = taskDef.title;
      const monthlyCount = TaskReminderService.getMonthlyCompletionCount(userTask.id, taskReminderState, now);
      const completionRate = TaskReminderService.getCompletionRate(userTask.id, taskReminderState, startOfMonth, now);

      if (monthlyCount > 0) {
        data[displayName] = `${monthlyCount}/${daysInMonth} days (${completionRate.toFixed(0)}%)`;
      } else {
        data[displayName] = `0/${daysInMonth} days (0%) - No completions this month`;
      }
    });

    // Process weekly tasks
    userTasks.weekly.forEach((userTask) => {
      const taskDef = getTaskDef(userTask.id);
      if (!taskDef) return;

      const displayName = taskDef.title;
      const monthlyCount = TaskReminderService.getMonthlyCompletionCount(userTask.id, taskReminderState, now);
      const avgPerWeek = TaskReminderService.getAverageCompletionsPerWeek(userTask.id, taskReminderState, startOfMonth, now);
      const weeksInMonth = Math.ceil(daysInMonth / 7);
      const expectedCompletions = weeksInMonth;

      if (monthlyCount > 0) {
        data[displayName] = `${monthlyCount}/${expectedCompletions} weeks (${avgPerWeek.toFixed(1)}/week avg)`;
      } else {
        data[displayName] = `0/${expectedCompletions} weeks - No completions this month`;
      }
    });

    // Process monthly tasks
    userTasks.monthly.forEach((userTask) => {
      const taskDef = getTaskDef(userTask.id);
      if (!taskDef) return;

      const displayName = taskDef.title;
      const monthlyCount = TaskReminderService.getMonthlyCompletionCount(userTask.id, taskReminderState, now);
      const record = taskReminderState[userTask.id];

      if (monthlyCount > 0 && record?.lastCompleted) {
        const lastCompleted = new Date(record.lastCompleted);
        const daysSince = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
        data[displayName] = `Completed this month (${daysSince} days ago)`;
      } else {
        data[displayName] = `Not completed this month`;
      }
    });

    return data;
  };

  const toggleExpanded = (petId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCardId(expandedCardId === petId ? null : petId);
  };

  const handleExportReport = async (pet: Pet) => {
    if (!userTasks) {
      Alert.alert('Error', 'No task data available to export.');
      return;
    }

    setIsExporting(true);

    try {
      const filePath = await PdfReportService.generateHealthReport({
        pet,
        userTasks,
        taskReminderState,
        reportDate: new Date(),
      });

      setIsExporting(false);
    } catch (error) {
      setIsExporting(false);
      console.error('Error exporting report:', error);
      Alert.alert(
        'Export Failed',
        'There was an error generating the report. Please try again.'
      );
    }
  };

  const renderPetCard = ({ item }: { item: Pet }) => {
    const isCurrentPet = currentPet?.id === item.id;
    const isExpanded = expandedCardId === item.id;
    const monthlyData = generateMonthlyData(item.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.petCard,
          isCurrentPet && styles.currentPetCard
        ]}
        onPress={() => setCurrentPet(item)}
      >
        <View style={styles.petCardContent}>
          <View style={styles.petAvatar}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>🐱</Text>
            )}
          </View>
          
          <View style={styles.petInfo}>
            <Text style={[
              styles.petName,
              isCurrentPet && styles.currentPetName
            ]}>
              {item.name} {item.gender === 'male' ? '♂' : item.gender === 'female' ? '♀' : '⚧'}
            </Text>
             <Text style={styles.petAge}>🗓️ {formatPetAge(item)}</Text>
            <Text style={styles.petBreed}>🐈‍⬛ {item.breed}</Text>
          </View>
        </View>

        <View style={styles.petCardActions}>
          {!isExpanded ? (
            <>
              <TouchableOpacity 
                style={styles.petCardActionButton}
                onPress={() => toggleExpanded(item.id)}
              >
                <Text style={styles.petCardActionButtonText}>More Info</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.petCardActionButton}
                onPress={() => navigation.getParent()?.navigate('ManagePet', { petId: item.id })}
              >
                <Text style={styles.petCardActionButtonText}>Edit</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.petCardActionButton}
                onPress={() => toggleExpanded(item.id)}
              >
                <Text style={styles.petCardActionButtonText}>Less Info</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.petCardActionButton}
                onPress={() => navigation.getParent()?.navigate('ManagePet', { petId: item.id })}
              >
                <Text style={styles.petCardActionButtonText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.dataTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Category</Text>
                <Text style={styles.tableHeaderText}>Monthly Data/Average</Text>
              </View>
              {Object.entries(monthlyData).map(([category, value], index) => (
                <View key={category} style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.tableRowEven
                ]}>
                  <Text style={styles.tableCategoryText}>{category}</Text>
                  <Text style={styles.tableValueText}>{value}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity 
              style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
              onPress={() => handleExportReport(item)}
              disabled={isExporting}
            >
              <Text style={styles.exportButtonText}>
                {isExporting ? 'Generating...' : 'Share Report'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isCurrentPet && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleAddPet = () => {
    // Navigate to onboarding flow to add a new cat with task selection
    navigation.getParent()?.navigate('Onboarding', { addNewCat: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cats</Text>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐱</Text>
          <Text style={styles.emptyTitle}>No cats added yet</Text>
          <Text style={styles.emptyDescription}>
            Add your first cat to start tracking their health and activities
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddPet}>
            <Text style={styles.emptyButtonText}>Add Your First Cat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={pets}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity style={styles.addCatButton} onPress={handleAddPet}>
            <Text style={styles.addCatButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: SPACING.md,
  },
  petCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: SPACING.md,
  },
  petCardActionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.gray,
    ...SHADOWS.small,
  },
  petCardActionButtonText: {
    ...TYPOGRAPHY.small,
    color: COLORS.text,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dataTable: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  tableHeaderText: {
    ...TYPOGRAPHY.small,
    color: COLORS.surface,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowEven: {
    backgroundColor: COLORS.surface,
  },
  tableCategoryText: {
    ...TYPOGRAPHY.small,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingRight: SPACING.sm,
  },
  tableValueText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'left',
    paddingLeft: SPACING.sm,
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    marginTop: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  exportButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  exportButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  contentContainer: {
    flex: 1,
  },
  addCatButton: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  addCatButtonText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.surface,
    fontWeight: '300',
  },
  listContainer: {
    padding: SPACING.lg,
  },
  petCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  currentPetCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  petAvatar: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    alignSelf: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  petInfo: {
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  petName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  currentPetName: {
    color: COLORS.primary,
  },
  petBreed: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  petAge: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  petGender: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  currentBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  currentBadgeText: {
    ...TYPOGRAPHY.small,
    color: COLORS.surface,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  emptyButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
});

export default PetProfilesScreen;
