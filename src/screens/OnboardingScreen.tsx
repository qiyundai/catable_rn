import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { PetForm } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, ONBOARDING_STEPS, PET_GENDER_OPTIONS, PET_BREED_OPTIONS, PET_PERSONALITY_OPTIONS } from '../constants';
import ProgressBar from '../components/ProgressBar';
import WheelPicker from '../components/WheelPicker';
import TagSelector from '../components/TagSelector';
import CardDeck from '../components/CardDeck';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85; // 85% of screen width
const CARD_HEIGHT = screenHeight * 0.6; // 60% of screen height


const OnboardingScreen: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [petForms, setPetForms] = useState<PetForm[]>([{
    name: '',
    breed: '',
    ageMonths: 12,
    gender: 'other',
    personality: '',
  }]);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [ageMonths, setAgeMonths] = useState(12); // Default to 1 year (12 months)
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  // New task selection states - initialize with all tasks selected by default
  const [selectedDailyTasks, setSelectedDailyTasks] = useState<string[]>(['feed', 'peeing_frequency', 'poop_consistency', 'activity', 'grooming']);
  const [selectedWeeklyTasks, setSelectedWeeklyTasks] = useState<string[]>(['sleep_breathing', 'tooth_brushing', 'nail_clipping']);
  const [selectedMonthlyTasks, setSelectedMonthlyTasks] = useState<string[]>(['flea_treatment', 'internal_deworming', 'vet_visit']);

  // Custom tasks state
  const [customTasks, setCustomTasks] = useState<{ [key: string]: any[] }>({
    daily: [],
    weekly: [],
    monthly: []
  });

  // Modal states
  const [showCustomTaskModal, setShowCustomTaskModal] = useState(false);
  const [currentTaskCategory, setCurrentTaskCategory] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [customTaskName, setCustomTaskName] = useState('');
  const [reminderTime, setReminderTime] = useState({ hour: 9, minute: 0, period: 'AM' });
  const [catPhotos, setCatPhotos] = useState<(string | null)[]>([null]);
  const [dynamicSteps, setDynamicSteps] = useState<any[]>([]);

  // Custom picker states
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [showPersonalityPicker, setShowPersonalityPicker] = useState(false);

  // Reminder time wheel picker states
  const [selectedHourIndex, setSelectedHourIndex] = useState(8); // 9 AM (index 8)
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(0); // 0 minutes
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0); // AM

  // Temporary picker values (for cancel/save functionality)
  const [tempSelectedYear, setTempSelectedYear] = useState(1);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(0);
  const [tempGender, setTempGender] = useState<'male' | 'female' | 'other'>('other');
  const [tempBreed, setTempBreed] = useState('');
  const [tempPersonality, setTempPersonality] = useState('');

  const { addPet, setOnboardingComplete, setUserTasks } = useAppStore();

  // Wheel picker data arrays
  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    label: (i + 1).toString(),
    value: i + 1
  }));

  const minuteOptions = [
    { label: '00', value: 0 },
    { label: '15', value: 15 },
    { label: '30', value: 30 },
    { label: '45', value: 45 }
  ];

  const periodOptions = [
    { label: 'AM', value: 0 },
    { label: 'PM', value: 1 }
  ];

  // Task data structure with new categorization
  const taskCategories = {
    daily: [
      { id: 'feed', name: 'Feed', icon: '', recurringCycle: 'daily', isCustom: false },
      { id: 'peeing_frequency', name: 'Peeing Frequency', icon: '', recurringCycle: 'daily', isCustom: false },
      { id: 'poop_consistency', name: 'Poop Consistency', icon: '', recurringCycle: 'daily', isCustom: false },
      { id: 'activity', name: 'Activity', icon: '', recurringCycle: 'daily', isCustom: false },
      { id: 'grooming', name: 'Grooming', icon: '', recurringCycle: 'daily', isCustom: false },
    ],
    weekly: [
      { id: 'sleep_breathing', name: 'Sleep Breathing Freq', icon: '', recurringCycle: 'weekly', isCustom: false },
      { id: 'tooth_brushing', name: 'Tooth Brushing', icon: '', recurringCycle: 'weekly', isCustom: false },
      { id: 'nail_clipping', name: 'Nail Clipping', icon: '', recurringCycle: 'weekly', isCustom: false },
    ],
    monthly: [
      { id: 'flea_treatment', name: 'Flea Treatment', icon: '', recurringCycle: 'monthly', isCustom: false },
      { id: 'internal_deworming', name: 'Internal Deworming', icon: '', recurringCycle: 'monthly', isCustom: false },
      { id: 'vet_visit', name: 'Vet Visit', icon: '', recurringCycle: 'monthly', isCustom: false },
    ]
  };

  // Generate dynamic steps based on number of cats
  const generateDynamicSteps = () => {
    const baseSteps = [...ONBOARDING_STEPS];
    const dynamicSteps: any[] = [];

    // For each cat after the first one, insert cat_name and cat_info steps
    for (let i = 1; i < petForms.length; i++) {
      dynamicSteps.push(
        {
          id: `cat_name_${i}`,
          title: `What's your ${i === 1 ? 'second' : `${i + 1}th`} cat's name?`,
          description: `Add a name and photo for your ${i === 1 ? 'second' : `${i + 1}th`} cat`,
          component: 'CatName',
          catIndex: i,
        },
        {
          id: `cat_info_${i}`,
          title: `Basic Information`,
          description: `Tell us about your ${i === 1 ? 'second' : `${i + 1}th`} cat`,
          component: 'CatInfo',
          catIndex: i,
        }
      );
    }

    // Insert dynamic steps after the first cat_info and before add_another
    const addAnotherIndex = baseSteps.findIndex(step => step.id === 'add_another');
    const result = [
      ...baseSteps.slice(0, addAnotherIndex),
      ...dynamicSteps,
      ...baseSteps.slice(addAnotherIndex)
    ];

    return result;
  };

  const allSteps = generateDynamicSteps();

  // Picker functions
  const openAgePicker = () => {
    setTempSelectedYear(selectedYear);
    setTempSelectedMonth(selectedMonth);
    setShowAgePicker(true);
  };

  const openGenderPicker = () => {
    setTempGender(getCurrentPetForm().gender);
    setShowGenderPicker(true);
  };

  const openBreedPicker = () => {
    setTempBreed(getCurrentPetForm().breed);
    setShowBreedPicker(true);
  };

  const openPersonalityPicker = () => {
    setTempPersonality(getCurrentPetForm().personality);
    setShowPersonalityPicker(true);
  };

  const cancelAgePicker = () => {
    setShowAgePicker(false);
  };

  const saveAgePicker = () => {
    setSelectedYear(tempSelectedYear);
    setSelectedMonth(tempSelectedMonth);
    const totalMonths = (tempSelectedYear * 12) + tempSelectedMonth;
    setAgeMonths(totalMonths);
    updateCurrentPetForm({ ageMonths: totalMonths });
    setShowAgePicker(false);
  };

  const cancelGenderPicker = () => {
    setShowGenderPicker(false);
  };

  const saveGenderPicker = () => {
    updateCurrentPetForm({ gender: tempGender });
    setShowGenderPicker(false);
  };

  const cancelBreedPicker = () => {
    setShowBreedPicker(false);
  };

  const saveBreedPicker = () => {
    updateCurrentPetForm({ breed: tempBreed });
    setShowBreedPicker(false);
  };

  const cancelPersonalityPicker = () => {
    setShowPersonalityPicker(false);
  };

  const savePersonalityPicker = () => {
    updateCurrentPetForm({ personality: tempPersonality });
    setShowPersonalityPicker(false);
  };


  const handleNext = () => {
    if (currentCardIndex < allSteps.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
    // If it's the last card, don't increment - let CardDeck handle completion
  };

  const handleSkip = () => {
    const skipTargetIndex = getSkipTargetIndex(currentCardIndex);
    
    if (skipTargetIndex < allSteps.length) {
      // Jump to the skip target
      setCurrentCardIndex(skipTargetIndex);
    } else {
      // Complete onboarding if we've reached the end
      setOnboardingComplete(true);
    }
  };

  const handleComplete = () => {
    // Complete onboarding - save all cats
    petForms.forEach((petForm, index) => {
      if (petForm.name) {
        const newPet: any = {
          id: Date.now().toString() + index,
          userId: '1',
          ...petForm,
          avatar: catPhotos[index] || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addPet(newPet);
      }
    });

    // Save user's selected tasks
    const userTasks = {
      daily: getCombinedTasks('daily').filter(task => selectedDailyTasks.includes(task.id)),
      weekly: getCombinedTasks('weekly').filter(task => selectedWeeklyTasks.includes(task.id)),
      monthly: getCombinedTasks('monthly').filter(task => selectedMonthlyTasks.includes(task.id)),
      customTasks: customTasks,
      reminderTime: {
        ...reminderTime,
        period: reminderTime.period as 'AM' | 'PM',
      },
    };
    setUserTasks(userTasks);

    // Mark onboarding as complete by setting index beyond the array
    setCurrentCardIndex(allSteps.length);
    setOnboardingComplete(true);
  };

  // Interactive input handlers for new task structure
  const toggleDailyTask = (taskId: string) => {
    setSelectedDailyTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(t => t !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleWeeklyTask = (taskId: string) => {
    setSelectedWeeklyTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(t => t !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleMonthlyTask = (taskId: string) => {
    setSelectedMonthlyTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(t => t !== taskId)
        : [...prev, taskId]
    );
  };

  const formatAge = (months: number) => {
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 12) {
      return '1 year';
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
    }
  };


  const showHourPicker = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    Alert.alert(
      'Select Hour',
      'Choose reminder hour',
      [
        { text: 'Cancel', style: 'cancel' },
        ...hours.map(hour => ({
          text: hour.toString(),
          onPress: () => setReminderTime(prev => ({ ...prev, hour }))
        }))
      ]
    );
  };

  const showMinutePicker = () => {
    const minutes = [0, 15, 30, 45];
    Alert.alert(
      'Select Minutes',
      'Choose reminder minutes',
      [
        { text: 'Cancel', style: 'cancel' },
        ...minutes.map(minute => ({
          text: minute.toString().padStart(2, '0'),
          onPress: () => setReminderTime(prev => ({ ...prev, minute }))
        }))
      ]
    );
  };

  const togglePeriod = () => {
    setReminderTime(prev => ({
      ...prev,
      period: prev.period === 'AM' ? 'PM' : 'AM'
    }));
  };

  // Wheel picker handlers for reminder time
  const handleHourChange = (index: number) => {
    setSelectedHourIndex(index);
    setReminderTime(prev => ({
      ...prev,
      hour: hourOptions[index].value
    }));
  };

  const handleMinuteChange = (index: number) => {
    setSelectedMinuteIndex(index);
    setReminderTime(prev => ({
      ...prev,
      minute: minuteOptions[index].value
    }));
  };

  const handlePeriodChange = (index: number) => {
    setSelectedPeriodIndex(index);
    setReminderTime(prev => ({
      ...prev,
      period: periodOptions[index].value === 0 ? 'AM' : 'PM'
    }));
  };

  // Custom task management functions
  const openCustomTaskModal = (category: 'daily' | 'weekly' | 'monthly') => {
    setCurrentTaskCategory(category);
    setCustomTaskName('');
    setShowCustomTaskModal(true);
  };

  const closeCustomTaskModal = () => {
    setShowCustomTaskModal(false);
    setCustomTaskName('');
  };

  const addCustomTask = () => {
    if (customTaskName.trim()) {
      const newTask = {
        id: `custom_${Date.now()}`,
        name: customTaskName.trim(),
        icon: '',
        recurringCycle: currentTaskCategory,
        isCustom: true
      };

      setCustomTasks(prev => ({
        ...prev,
        [currentTaskCategory]: [...prev[currentTaskCategory], newTask]
      }));

      // Auto-select the new custom task
      const setter = currentTaskCategory === 'daily' ? setSelectedDailyTasks :
        currentTaskCategory === 'weekly' ? setSelectedWeeklyTasks : setSelectedMonthlyTasks;
      setter(prev => [...prev, newTask.id]);

      closeCustomTaskModal();
    }
  };

  const getCombinedTasks = (category: 'daily' | 'weekly' | 'monthly') => {
    return [...taskCategories[category], ...customTasks[category]];
  };

  // Smart skip logic system
  const getNextFlowControlIndex = (currentIndex: number): number => {
    for (let i = currentIndex + 1; i < allSteps.length; i++) {
      if (allSteps[i].type === 'flow_control') {
        return i;
      }
    }
    return allSteps.length - 1; // If no flow control found, go to last step
  };

  const getSkipTargetIndex = (currentIndex: number): number => {
    const currentStep = allSteps[currentIndex];

    switch (currentStep.skipBehavior) {
      case 'skip_to_next_flow_control':
        return getNextFlowControlIndex(currentIndex);
      case 'next':
      default:
        return currentIndex + 1;
    }
  };

  const shouldShowSkipButton = (currentIndex: number): boolean => {
    const currentStep = allSteps[currentIndex];
    return currentStep.type === 'flow_control' || currentStep.skipBehavior !== 'next';
  };

  const addAnotherCat = () => {
    setPetForms(prev => [
      ...prev,
      {
        name: '',
        breed: '',
        age: 1,
        ageMonths: 0,
        gender: 'other',
        personality: '',
      }
    ]);
    setCatPhotos(prev => [...prev, null]);
    // The dynamic steps will be regenerated automatically
  };


  const getCurrentPetForm = () => {
    const currentStep = allSteps[currentCardIndex];
    const catIndex = currentStep?.catIndex || 0;
    return petForms[catIndex] || petForms[0];
  };

  const updateCurrentPetForm = (updates: Partial<PetForm>) => {
    const currentStep = allSteps[currentCardIndex];
    const catIndex = currentStep?.catIndex || 0;
    setPetForms(prev => prev.map((form, index) =>
      index === catIndex ? { ...form, ...updates } : form
    ));
  };

  const getCurrentCatPhoto = () => {
    const currentStep = allSteps[currentCardIndex];
    const catIndex = currentStep?.catIndex || 0;
    return catPhotos[catIndex] || null;
  };

  const setCurrentCatPhoto = (photo: string | null) => {
    const currentStep = allSteps[currentCardIndex];
    const catIndex = currentStep?.catIndex || 0;
    setCatPhotos(prev => prev.map((p, index) =>
      index === catIndex ? photo : p
    ));
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to select a photo!'
        );
        return;
      }

      // Show action sheet for image source
      Alert.alert(
        'Select Photo',
        'Choose how you want to add a photo',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Camera',
            onPress: () => openCamera()
          },
          {
            text: 'Photo Library',
            onPress: () => openImageLibrary()
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take a photo!'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCurrentCatPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCurrentCatPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const renderCardContent = (step: any) => {
    const currentPetForm = getCurrentPetForm();
    const currentCatPhoto = getCurrentCatPhoto();

    switch (step.id) {
      case 'welcome':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🐱</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
          </View>
        );

      case 'cat_name':
      case 'cat_name_1':
      case 'cat_name_2':
      case 'cat_name_3':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📝</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cat's Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your cat's name"
                placeholderTextColor={COLORS.textSecondary}
                value={currentPetForm.name}
                onChangeText={(text) => updateCurrentPetForm({ name: text })}
                autoFocus={false}
              />
            </View>
            <TouchableOpacity style={styles.avatarPlaceholder} onPress={pickImage}>
              {currentCatPhoto ? (
                <Image source={{ uri: currentCatPhoto }} style={styles.avatarImage} />
              ) : (
                <>
                  <Text style={styles.avatarEmoji}>📷</Text>
                  <Text style={styles.avatarText}>Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'cat_info':
      case 'cat_info_1':
      case 'cat_info_2':
      case 'cat_info_3':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>ℹ️</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
            <View style={styles.infoColumn}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TouchableOpacity
                  style={styles.inputField}
                  onPress={openAgePicker}
                >
                  <View style={styles.inputValueContainer}>
                    <Text style={styles.inputValue}>{formatAge(ageMonths)}</Text>
                    <Text style={styles.inputIcon}>⌄</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <TouchableOpacity
                  style={styles.inputField}
                  onPress={openGenderPicker}
                >
                  <View style={styles.inputValueContainer}>
                    <Text style={styles.inputValue}>{currentPetForm.gender.charAt(0).toUpperCase() + currentPetForm.gender.slice(1)}</Text>
                    <Text style={styles.inputIcon}>⌄</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Breed</Text>
                <TouchableOpacity
                  style={styles.inputField}
                  onPress={openBreedPicker}
                >
                  <View style={styles.inputValueContainer}>
                    <Text style={styles.inputValue}>{currentPetForm.breed || 'Select breed'}</Text>
                    <Text style={styles.inputIcon}>⌄</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Personality</Text>
                <TouchableOpacity
                  style={styles.inputField}
                  onPress={openPersonalityPicker}
                >
                  <View style={styles.inputValueContainer}>
                    <Text style={styles.inputValue}>{currentPetForm.personality || 'Select personality'}</Text>
                    <Text style={styles.inputIcon}>⌄</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 'add_another':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🐱🐱</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
          </View>
        );

      case 'logging_goals':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🎯</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
          </View>
        );

      case 'daily_tasks':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📅</Text>
            </View>
            <TagSelector
              tasks={getCombinedTasks('daily')}
              selectedTasks={selectedDailyTasks}
              onTaskToggle={toggleDailyTask}
              onAddCustomTask={() => openCustomTaskModal('daily')}
              title={step.title}
              description={step.description}
            />
          </View>
        );

      case 'weekly_tasks':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📊</Text>
            </View>
            <TagSelector
              tasks={getCombinedTasks('weekly')}
              selectedTasks={selectedWeeklyTasks}
              onTaskToggle={toggleWeeklyTask}
              onAddCustomTask={() => openCustomTaskModal('weekly')}
              title={step.title}
              description={step.description}
            />
          </View>
        );

      case 'monthly_tasks':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📆</Text>
            </View>
            <TagSelector
              tasks={getCombinedTasks('monthly')}
              selectedTasks={selectedMonthlyTasks}
              onTaskToggle={toggleMonthlyTask}
              onAddCustomTask={() => openCustomTaskModal('monthly')}
              title={step.title}
              description={step.description}
            />
          </View>
        );

      case 'reminder_time':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>⏰</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
            <View style={styles.timePickerWheel}>
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Hour</Text>
                <WheelPicker
                  items={hourOptions}
                  selectedIndex={selectedHourIndex}
                  onSelectionChange={handleHourChange}
                />
              </View>
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Minute</Text>
                <WheelPicker
                  items={minuteOptions}
                  selectedIndex={selectedMinuteIndex}
                  onSelectionChange={handleMinuteChange}
                />
              </View>
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Period</Text>
                <WheelPicker
                  items={periodOptions}
                  selectedIndex={selectedPeriodIndex}
                  onSelectionChange={handlePeriodChange}
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderCardForDeck = (step: any, index: number, relativeIndex: number, isTopCard: boolean) => {
    return renderCardContent(step);
  };

  // Check if onboarding is complete
  const onboardingComplete = currentCardIndex >= allSteps.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          current={currentCardIndex + 1}
          total={allSteps.length}
          showText={true}
          height={16}
        />
      </View>

      {/* Card Deck */}
      <View style={styles.cardDeck}>
        {onboardingComplete ? (
          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Welcome to Catable!</Text>
            <Text style={styles.completionDescription}>
              You're all set to start tracking your cat's health and activities.
            </Text>
            <Text style={styles.completionSubtext}>
              You're all set to start tracking! 🐱
            </Text>
          </View>
        ) : (
          <CardDeck
            items={allSteps}
            currentIndex={currentCardIndex}
            onNext={handleNext}
            onSkip={handleSkip}
            onComplete={handleComplete}
            renderCard={renderCardForDeck}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
            maxVisibleCards={3}
            primaryButtonText={
              allSteps[currentCardIndex]?.id === 'add_another'
                ? 'Yes, Add'
                : currentCardIndex === allSteps.length - 1
                ? 'Complete'
                : 'Next'
            }
            secondaryButtonText={
              allSteps[currentCardIndex]?.id === 'add_another'
                ? 'No, Continue'
                : 'Skip'
            }
            onPrimaryAction={(item, index) => {
              if (item.id === 'add_another') {
                addAnotherCat();
                handleNext();
              } else {
                // Default behavior for other steps
                if (index < allSteps.length - 1) {
                  handleNext();
                } else {
                  handleComplete();
                }
              }
            }}
            onSecondaryAction={(item, index) => {
              if (item.id === 'add_another') {
                handleNext();
              } else {
                // Default behavior for other steps
                handleSkip();
              }
            }}
          />
        )}
      </View>

      {/* Simplified Picker Drawers */}
      {/* Age Picker */}
      <Modal
        visible={showAgePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelAgePicker}
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.pickerContainer}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={cancelAgePicker}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Age</Text>
              <TouchableOpacity onPress={saveAgePicker}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wheelContainer}>
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Years</Text>
                <WheelPicker
                  items={Array.from({ length: 20 }, (_, i) => ({ label: i.toString(), value: i }))}
                  selectedIndex={tempSelectedYear}
                  onSelectionChange={setTempSelectedYear}
                />
              </View>

              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Months</Text>
                <WheelPicker
                  items={Array.from({ length: 12 }, (_, i) => ({ label: i.toString(), value: i }))}
                  selectedIndex={tempSelectedMonth}
                  onSelectionChange={setTempSelectedMonth}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gender Picker */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelGenderPicker}
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.pickerContainer}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={cancelGenderPicker}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Gender</Text>
              <TouchableOpacity onPress={saveGenderPicker}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {PET_GENDER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    tempGender === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => setTempGender(option.value as 'male' | 'female' | 'other')}
                >
                  <Text style={[
                    styles.optionText,
                    tempGender === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {tempGender === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Breed Picker */}
      <Modal
        visible={showBreedPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelBreedPicker}
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.pickerContainer}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={cancelBreedPicker}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Breed</Text>
              <TouchableOpacity onPress={saveBreedPicker}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {PET_BREED_OPTIONS.map(breed => (
                <TouchableOpacity
                  key={breed.value}
                  style={[
                    styles.optionItem,
                    tempBreed === breed.value && styles.optionItemSelected
                  ]}
                  onPress={() => setTempBreed(breed.value)}
                >
                  <Text style={[
                    styles.optionText,
                    tempBreed === breed.value && styles.optionTextSelected
                  ]}>
                    {breed.label}
                  </Text>
                  {tempBreed === breed.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Personality Picker */}
      <Modal
        visible={showPersonalityPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelPersonalityPicker}
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.pickerContainer}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={cancelPersonalityPicker}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Personality</Text>
              <TouchableOpacity onPress={savePersonalityPicker}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {PET_PERSONALITY_OPTIONS.map(personality => (
                <TouchableOpacity
                  key={personality.value}
                  style={[
                    styles.optionItem,
                    tempPersonality === personality.value && styles.optionItemSelected
                  ]}
                  onPress={() => setTempPersonality(personality.value)}
                >
                  <Text style={[
                    styles.optionText,
                    tempPersonality === personality.value && styles.optionTextSelected
                  ]}>
                    {personality.label}
                  </Text>
                  {tempPersonality === personality.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Task Modal */}
      <Modal
        visible={showCustomTaskModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeCustomTaskModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={closeCustomTaskModal}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Add Custom Task</Text>
              <TouchableOpacity onPress={addCustomTask}>
                <Text style={styles.pickerSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.customTaskContent}>
              <Text style={styles.customTaskLabel}>
                Add a custom {currentTaskCategory} task to track
              </Text>
              <TextInput
                style={styles.customTaskInput}
                placeholder="Enter task name..."
                value={customTaskName}
                onChangeText={setCustomTaskName}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={addCustomTask}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  cardDeck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: SPACING.lg,
    position: 'relative',
  },
  leftIndicator: {
    left: SPACING.lg,
    backgroundColor: COLORS.error,
  },
  rightIndicator: {
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  leftIndicatorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  rightIndicatorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.surface,
    fontWeight: 'bold',
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
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.xl,
    paddingBottom: SPACING.xl + 60, // Extra padding for buttons (60px button height)
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
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  completionTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  completionDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  completionSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  textInput: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  inputPlaceholder: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  avatarEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  avatarText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  infoColumn: {
    width: '100%',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  inputField: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  inputValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  inputIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  taskList: {
    width: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeColumn: {
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  timeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timeValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  timeSeparator: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
  },
  timePickerWheel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  // Custom Picker Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingBottom: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  pickerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 400,
    paddingVertical: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primary + '10', // 10% opacity
  },
  optionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Wheel Picker Styles
  wheelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  // Add Another Cat Button Styles
  buttonContainer: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  actionButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  continueButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  addButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
  },
  continueButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  // Custom Task Modal Styles
  customTaskContent: {
    padding: SPACING.lg,
  },
  customTaskLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  customTaskInput: {
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
});

export default OnboardingScreen;
