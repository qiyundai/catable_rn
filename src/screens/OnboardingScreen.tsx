import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
  TextInput,
  Alert,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { PetForm } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, ONBOARDING_STEPS } from '../constants';
import ProgressBar from '../components/ProgressBar';
import Card from '../components/Card';
import WheelPicker from '../components/WheelPicker';
import TagSelector from '../components/TagSelector';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85; // 85% of screen width
const CARD_HEIGHT = screenHeight * 0.6; // 60% of screen height


const OnboardingScreen: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [petForms, setPetForms] = useState<PetForm[]>([{
    name: '',
    breed: '',
    age: 1,
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

  const { addPet, setOnboardingComplete } = useAppStore();

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
      { id: 'feed', name: 'Feed', icon: '' },
      { id: 'peeing_frequency', name: 'Peeing Frequency', icon: '' },
      { id: 'poop_consistency', name: 'Poop Consistency', icon: '' },
      { id: 'activity', name: 'Activity', icon: '' },
      { id: 'grooming', name: 'Grooming', icon: '' },
    ],
    weekly: [
      { id: 'sleep_breathing', name: 'Sleep Breathing Freq', icon: '' },
      { id: 'tooth_brushing', name: 'Tooth Brushing', icon: '' },
      { id: 'nail_clipping', name: 'Nail Clipping', icon: '' },
    ],
    monthly: [
      { id: 'flea_treatment', name: 'Flea Treatment', icon: '' },
      { id: 'internal_deworming', name: 'Internal Deworming', icon: '' },
      { id: 'vet_visit', name: 'Vet Visit', icon: '' },
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
    updateCurrentPetForm({ age: tempSelectedYear || 1 });
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
    if (currentCardIndex < allSteps.length - 1) {
      nextCard('right');
    } else {
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
      setOnboardingComplete(true);
    }
  };

  const handleSkip = () => {
    if (currentCardIndex < allSteps.length - 1) {
      nextCard('left');
    } else {
      setOnboardingComplete(true);
    }
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

  const addAnotherCat = () => {
    setPetForms(prev => [...prev, {
      name: '',
      breed: '',
      age: 1,
      gender: 'other',
      personality: '',
    }]);
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
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.addButton]}
                onPress={addAnotherCat}
              >
                <Text style={styles.addButtonText}>Add Another Cat</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.continueButton]}
                onPress={handleNext}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
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
              tasks={taskCategories.daily}
              selectedTasks={selectedDailyTasks}
              onTaskToggle={toggleDailyTask}
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
              tasks={taskCategories.weekly}
              selectedTasks={selectedWeeklyTasks}
              onTaskToggle={toggleWeeklyTask}
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
              tasks={taskCategories.monthly}
              selectedTasks={selectedMonthlyTasks}
              onTaskToggle={toggleMonthlyTask}
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

  const renderCard = (step: any, index: number, relativeIndex: number) => {
    const isTopCard = relativeIndex === 0;
    
    // Calculate scale for inactive cards
    const scaleFactor = isTopCard ? 1 : Math.max(0.95 - (relativeIndex * 0.03), 0.7);

    const cardStyle = [
      styles.card,
      isTopCard && styles.topCard,
    ];

    return (
      <Animated.View
        key={step.id}
        style={[
          cardStyle,
          {
            bottom: isTopCard ? 160 : 175 + (relativeIndex * 25),
            zIndex: isTopCard ? 10 : 10 - relativeIndex,
            transform: [
              { translateX: isTopCard ? position.x : 0 },
              { translateY: isTopCard ? position.y : 0 },
              { rotate: isTopCard ? rotate : '0deg' },
              { scale: scaleFactor },
            ],
          },
          isTopCard && {
            backgroundColor: cardBackgroundColor,
          },
        ]}
        {...(isTopCard ? panResponder.panHandlers : {})}
      >
        {renderCardContent(step)}
      </Animated.View>
    );
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
              Swipe to begin your journey! 🐱
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
              <Text style={styles.rightIndicatorText}>
                {currentCardIndex === allSteps.length - 1 ? 'START' : 'NEXT'}
        </Text>
            </Animated.View>

            {allSteps
              .map((step, index) => ({ step, index }))
              .filter(({ index }) => index >= currentCardIndex)
              .slice(0, 3) // Only show next 2 cards (3 cards total: active + 2 behind)
              .map(({ step, index }, relativeIndex) => renderCard(step, index, relativeIndex))}
          </>
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
              {[
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' }
              ].map(option => (
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
              {[
                'Mixed', 'Persian', 'Maine Coon', 'Siamese', 'British Shorthair',
                'Ragdoll', 'American Shorthair', 'Scottish Fold', 'Other'
              ].map(breed => (
                <TouchableOpacity
                  key={breed}
                  style={[
                    styles.optionItem,
                    tempBreed === breed && styles.optionItemSelected
                  ]}
                  onPress={() => setTempBreed(breed)}
                >
                  <Text style={[
                    styles.optionText,
                    tempBreed === breed && styles.optionTextSelected
                  ]}>
                    {breed}
                  </Text>
                  {tempBreed === breed && (
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
              {[
                'Playful', 'Calm', 'Energetic', 'Independent', 
                'Affectionate', 'Curious', 'Shy', 'Social'
              ].map(personality => (
                <TouchableOpacity
                  key={personality}
                  style={[
                    styles.optionItem,
                    tempPersonality === personality && styles.optionItemSelected
                  ]}
                  onPress={() => setTempPersonality(personality)}
                >
                  <Text style={[
                    styles.optionText,
                    tempPersonality === personality && styles.optionTextSelected
                  ]}>
                    {personality}
          </Text>
                  {tempPersonality === personality && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    borderRadius: 50,
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
    borderRadius: 50,
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
});

export default OnboardingScreen;
