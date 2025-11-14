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
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store';
import { Pet } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS, PET_BREED_OPTIONS, PET_GENDER_OPTIONS } from '../constants';
import { TASK_DEFINITIONS, getTaskById, getTaskByOldId, TaskDefinition } from '../constants/tasks';
import TaskReminderService from '../services/TaskReminderService';
import PdfReportService from '../services/PdfReportService';
import { formatPetAge } from '../utils/petUtils';
import * as ImagePicker from 'expo-image-picker';
import WheelPicker from '../components/WheelPicker';
import { Ionicons } from '@expo/vector-icons';

type PetProfilesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PetProfilesScreen: React.FC = () => {
  const { pets, currentPet, setCurrentPet, userTasks, taskReminderState, updatePet, setTaskFrequency, getTaskFrequency } = useAppStore();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Pet>>({});
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerType, setPickerType] = useState<'breed' | 'gender' | 'age' | 'taskFrequency' | null>(null);
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const navigation = useNavigation<PetProfilesScreenNavigationProp>();

  // Wheel picker options for age
  const yearOptions = Array.from({ length: 31 }, (_, i) => ({
    label: i.toString(),
    value: i
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: i.toString(),
    value: i
  }));

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
      return getTaskByOldId(taskId) || getTaskById(taskId) || null;
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

  const startEditing = (pet: Pet) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingPetId(pet.id);
    setEditForm({...pet});
    const years = Math.floor(pet.ageMonths / 12);
    const months = pet.ageMonths % 12;
    setSelectedYear(years);
    setSelectedMonth(months);
  };

  const cancelEditing = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingPetId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (!editForm.name?.trim()) {
      Alert.alert('Error', 'Pet name cannot be empty');
      return;
    }

    if (!editForm.breed?.trim()) {
      Alert.alert('Error', 'Please select a breed');
      return;
    }

    if (!editForm.gender) {
      Alert.alert('Error', 'Please select a gender');
      return;
    }

    if (!editForm.personality?.trim()) {
      Alert.alert('Error', 'Please describe your cat\'s personality');
      return;
    }

    const ageMonths = (selectedYear * 12) + selectedMonth;
    if (ageMonths === 0) {
      Alert.alert('Error', 'Please set an age for your pet');
      return;
    }

    if (!editForm.id) {
      Alert.alert('Error', 'Invalid pet ID');
      return;
    }

    updatePet(editForm.id, {
      name: editForm.name,
      avatar: editForm.avatar,
      breed: editForm.breed,
      gender: editForm.gender,
      personality: editForm.personality,
      ageMonths,
      updatedAt: new Date(),
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingPetId(null);
    setEditForm({});
    Alert.alert('Success', 'Pet profile updated successfully');
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to select a photo!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setEditForm({ ...editForm, avatar: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const openPicker = (type: 'breed' | 'gender' | 'age' | 'taskFrequency', taskId?: string) => {
    setPickerType(type);
    if (type === 'taskFrequency' && taskId && currentPet) {
      setEditingTaskId(taskId);
      // Get the task's current frequency from the store (supports both old and new format)
      const storedFrequency = getTaskFrequency(currentPet.id, taskId);
      // If not in store, get from task's default recurringCycle
      const task = userTasks ? [...userTasks.daily, ...userTasks.weekly, ...userTasks.monthly].find(t => t.id === taskId) : null;
      const frequency = storedFrequency || (task?.recurringCycle || 'daily');
      const { number, period } = convertFromFrequency(frequency);
      setSelectedNumber(number);
      setSelectedPeriod(period);
    }
    setShowPickerModal(true);
  };

  const handlePickerSelect = (value: string) => {
    if (pickerType === 'breed') {
      setEditForm({ ...editForm, breed: value });
      setShowPickerModal(false);
    } else if (pickerType === 'gender') {
      setEditForm({ ...editForm, gender: value as 'male' | 'female' | 'other' });
      setShowPickerModal(false);
    }
  };

  const handleTaskFrequencyConfirm = () => {
    if (editingTaskId && currentPet && userTasks) {
      // Store the custom frequency as an object with number + period
      const customFrequency: { number: number; period: 'day' | 'week' | 'month' } = {
        number: selectedNumber,
        period: selectedPeriod,
      };
      
      // Save to store using setTaskFrequency
      setTaskFrequency(currentPet.id, editingTaskId, customFrequency);
      
      // Also update the task's recurringCycle in userTasks for backward compatibility
      // Convert to standard frequency for the recurringCycle field
      let standardFrequency: 'daily' | 'weekly' | 'monthly';
      if (selectedPeriod === 'day' && selectedNumber === 1) {
        standardFrequency = 'daily';
      } else if (selectedPeriod === 'week' && selectedNumber === 1) {
        standardFrequency = 'weekly';
      } else if (selectedPeriod === 'month' && selectedNumber === 1) {
        standardFrequency = 'monthly';
      } else {
        // For custom frequencies, map to closest standard
        standardFrequency = selectedPeriod === 'day' ? 'daily' : selectedPeriod === 'week' ? 'weekly' : 'monthly';
      }
      
      // Find which array the task is currently in
      const allTasks = [...userTasks.daily, ...userTasks.weekly, ...userTasks.monthly];
      const task = allTasks.find(t => t.id === editingTaskId);
      
      if (task) {
        // Remove task from current array
        let newDaily = userTasks.daily.filter(t => t.id !== editingTaskId);
        let newWeekly = userTasks.weekly.filter(t => t.id !== editingTaskId);
        let newMonthly = userTasks.monthly.filter(t => t.id !== editingTaskId);

        // Update task with new frequency
        const updatedTask = { ...task, recurringCycle: standardFrequency };

        // Add to appropriate array based on standard frequency
        if (standardFrequency === 'daily') {
          newDaily.push(updatedTask);
        } else if (standardFrequency === 'weekly') {
          newWeekly.push(updatedTask);
        } else {
          newMonthly.push(updatedTask);
        }

        // Update the store
        const { setUserTasks } = useAppStore.getState();
        setUserTasks({
          ...userTasks,
          daily: newDaily,
          weekly: newWeekly,
          monthly: newMonthly,
        });
      }
    }
    setShowPickerModal(false);
  };

  const handleAgeConfirm = () => {
    setShowPickerModal(false);
  };

  const getPickerOptions = () => {
    if (pickerType === 'breed') return PET_BREED_OPTIONS;
    if (pickerType === 'gender') return PET_GENDER_OPTIONS;
    return [];
  };

  const renderPetCard = ({ item }: { item: Pet }) => {
    const isCurrentPet = currentPet?.id === item.id;
    const isExpanded = expandedCardId === item.id;
    const isEditing = editingPetId === item.id;
    const monthlyData = generateMonthlyData(item.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.petCard,
          isCurrentPet && styles.currentPetCard
        ]}
        onPress={() => !isEditing && setCurrentPet(item)}
        activeOpacity={isEditing ? 1 : 0.7}
      >
        <View style={styles.petCardContent}>
          <TouchableOpacity 
            style={styles.petAvatar} 
            onPress={isEditing ? pickImage : undefined}
            disabled={!isEditing}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            {(isEditing ? editForm.avatar : item.avatar) ? (
              <Image source={{ uri: isEditing ? editForm.avatar : item.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>🐱</Text>
            )}
            {isEditing && (
              <View style={styles.avatarEditOverlay}>
                <Ionicons name="pencil" size={24} color={COLORS.surface} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.petInfo}>
            {isEditing ? (
              <View style={styles.formFieldContainer}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  placeholder="Pet name"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            ) : (
              <>
                <Text style={[
                  styles.petName,
                  isCurrentPet && styles.currentPetName
                ]}>
                  {item.name} {item.gender === 'male' ? '♂' : item.gender === 'female' ? '♀' : '⚧'}
                </Text>
                <Text style={styles.petAge}>🗓️ {formatPetAge(item)}</Text>
                <Text style={styles.petBreed}>🐈‍⬛ {item.breed}</Text>
              </>
            )}
          </View>
        </View>

        {!isEditing && item.personality && (
          <View style={styles.personalitySection}>
            <Text style={styles.personalityText}>"{item.personality}"</Text>
          </View>
        )}

        {isEditing && (
          <View style={styles.editForm}>
            <View style={styles.formFieldContainer}>
              <Text style={styles.formLabel}>Age</Text>
              <TouchableOpacity 
                style={styles.formInput}
                onPress={() => openPicker('age')}
              >
                <Text style={styles.formInputText}>
                  {selectedYear > 0 || selectedMonth > 0 
                    ? `${selectedYear} year${selectedYear !== 1 ? 's' : ''} ${selectedMonth} month${selectedMonth !== 1 ? 's' : ''}`
                    : 'Select age'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formFieldContainer}>
              <Text style={styles.formLabel}>Gender</Text>
              <TouchableOpacity 
                style={styles.formInput}
                onPress={() => openPicker('gender')}
              >
                <Text style={styles.formInputText}>
                  {editForm.gender ? editForm.gender.charAt(0).toUpperCase() + editForm.gender.slice(1) : 'Select gender'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formFieldContainer}>
              <Text style={styles.formLabel}>Breed</Text>
              <TouchableOpacity 
                style={styles.formInput}
                onPress={() => openPicker('breed')}
              >
                <Text style={styles.formInputText}>{editForm.breed || 'Select breed'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formFieldContainer}>
              <Text style={styles.formLabel}>Personality</Text>
              <TextInput
                style={[styles.formInput, styles.textAreaInput]}
                value={editForm.personality}
                onChangeText={(text) => setEditForm({ ...editForm, personality: text })}
                placeholder="Describe your cat's personality..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {userTasks && (() => {
              // Create a stable sorted list of all tasks to prevent reordering
              const allTasks = [...userTasks.daily, ...userTasks.weekly, ...userTasks.monthly];
              const sortedTasks = [...allTasks].sort((a, b) => a.id.localeCompare(b.id));
              
              return (
                <View style={styles.taskFrequencySection}>
                  <Text style={styles.sectionSubtitle}>Task Frequency</Text>
                  {sortedTasks.map((task) => {
                    // Get the actual frequency from store to display correctly
                    const storedFrequency = currentPet ? getTaskFrequency(currentPet.id, task.id) : null;
                    const displayFrequency = storedFrequency || task.recurringCycle || 'daily';
                    const { number, period } = convertFromFrequency(displayFrequency);
                    const displayText = number === 1 
                      ? (period === 'day' ? 'Daily' : period === 'week' ? 'Weekly' : 'Monthly')
                      : `${number} ${period}${number > 1 ? 's' : ''}`;
                    
                    return (
                      <View key={task.id} style={styles.formFieldContainer}>
                        <Text style={styles.formLabel}>{task.name}</Text>
                        <TouchableOpacity 
                          style={styles.formInput}
                          onPress={() => openPicker('taskFrequency', task.id)}
                        >
                          <Text style={styles.formInputText}>{displayText}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })()}

            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.editActionButton}
                onPress={cancelEditing}
              >
                <Text style={styles.editActionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editActionButton, styles.saveButton]}
                onPress={saveEditing}
              >
                <Text style={[styles.editActionButtonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isEditing && (
          <View style={styles.petCardActions}>
            <TouchableOpacity 
              style={styles.petCardActionButton}
              onPress={() => toggleExpanded(item.id)}
            >
              <Text style={styles.petCardActionButtonText}>
                {isExpanded ? 'Collapse Report' : 'View Report'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isEditing && isExpanded && (
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
            <View style={styles.exportButtonContainer}>
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
          </View>
        )}

        {isCurrentPet && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        )}

        {!isEditing && (
          <TouchableOpacity 
            style={styles.editIconButton}
            onPress={() => startEditing(item)}
          >
            <Ionicons name="pencil" size={20} color={COLORS.text} />
          </TouchableOpacity>
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

      {/* Picker Modal */}
      <Modal
        visible={showPickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowPickerModal(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>
                {pickerType === 'age' ? 'Select Age' :
                 pickerType === 'gender' ? 'Select Gender' :
                 pickerType === 'taskFrequency' ? 'Select Frequency' :
                 'Select Breed'}
              </Text>
              <TouchableOpacity onPress={
                pickerType === 'age' ? handleAgeConfirm :
                pickerType === 'taskFrequency' ? handleTaskFrequencyConfirm :
                () => setShowPickerModal(false)
              }>
                <Text style={styles.pickerSaveText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            {pickerType === 'age' ? (
              <View style={styles.wheelContainer}>
                <View style={styles.sharedSelectionBar} pointerEvents="none" />
                
                <View style={styles.wheelColumn}>
                  <Text style={styles.wheelLabel}>Years</Text>
                  <WheelPicker
                    items={yearOptions}
                    selectedIndex={yearOptions.findIndex(opt => opt.value === selectedYear)}
                    onSelectionChange={(index) => setSelectedYear(yearOptions[index].value)}
                    showSelectionIndicator={false}
                  />
                </View>

                <View style={styles.wheelColumn}>
                  <Text style={styles.wheelLabel}>Months</Text>
                  <WheelPicker
                    items={monthOptions}
                    selectedIndex={monthOptions.findIndex(opt => opt.value === selectedMonth)}
                    onSelectionChange={(index) => setSelectedMonth(monthOptions[index].value)}
                    showSelectionIndicator={false}
                  />
                </View>
              </View>
            ) : pickerType === 'taskFrequency' ? (
              <View style={styles.wheelContainer}>
                <View style={styles.sharedSelectionBar} pointerEvents="none" />
                
                <View style={styles.wheelColumn}>
                  <WheelPicker
                    items={Array.from({ length: selectedPeriod === 'day' ? 30 : 12 }, (_, i) => ({
                      label: (i + 1).toString(),
                      value: i + 1,
                    }))}
                    selectedIndex={Math.min(selectedNumber - 1, (selectedPeriod === 'day' ? 30 : 12) - 1)}
                    onSelectionChange={(index) => setSelectedNumber(index + 1)}
                    showSelectionIndicator={false}
                  />
                </View>
                <View style={styles.wheelColumn}>
                  <WheelPicker
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
                    showSelectionIndicator={false}
                  />
                </View>
              </View>
            ) : (
              <ScrollView style={styles.optionsList}>
                {getPickerOptions().map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      (pickerType === 'breed' && editForm.breed === option.value) ||
                      (pickerType === 'gender' && editForm.gender === option.value)
                        ? styles.optionItemSelected
                        : null
                    ]}
                    onPress={() => handlePickerSelect(option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      ((pickerType === 'breed' && editForm.breed === option.value) ||
                       (pickerType === 'gender' && editForm.gender === option.value))
                        ? styles.optionTextSelected
                        : null
                    ]}>
                      {option.label}
                    </Text>
                    {((pickerType === 'breed' && editForm.breed === option.value) ||
                      (pickerType === 'gender' && editForm.gender === option.value)) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    marginTop: SPACING.lg,
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
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
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
  exportButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.small,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  exportButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.6,
  },
  exportButtonText: {
    ...TYPOGRAPHY.small,
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  addCatButtonText: {
    ...TYPOGRAPHY.h1,
    color: '#000000',
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
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  petName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginBottom: SPACING.sm,
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
    marginBottom: SPACING.sm,
  },
  petGender: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  currentBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
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
  editIconButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  avatarEditOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editForm: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
  },
  formFieldContainer: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  formLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  formInput: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    width: '100%',
  },
  formInputText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  taskFrequencySection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  personalitySection: {
    alignItems: 'center',
  },
  personalityText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  editActionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.gray,
    ...SHADOWS.small,
    minWidth: 80,
    alignItems: 'center',
  },
  editActionButtonText: {
    ...TYPOGRAPHY.small,
    color: COLORS.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: COLORS.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  pickerCancelText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  pickerSaveText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  optionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  wheelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  wheelColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  wheelLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  sharedSelectionBar: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    height: 40,
    top: '50%',
    marginTop: -4,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    zIndex: -1,
  },
});

export default PetProfilesScreen;
