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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85; // 85% of screen width
const CARD_HEIGHT = screenHeight * 0.6; // 60% of screen height


const OnboardingScreen: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [petForm, setPetForm] = useState<PetForm>({
    name: '',
    breed: '',
    age: 1,
    gender: 'other',
    personality: '',
  });
  const [ageMonths, setAgeMonths] = useState(12); // Default to 1 year (12 months)
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDailyTasks, setSelectedDailyTasks] = useState<string[]>([]);
  const [selectedRecurringTasks, setSelectedRecurringTasks] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState({ hour: 9, minute: 0, period: 'AM' });
  const [catPhoto, setCatPhoto] = useState<string | null>(null);
  
  // Custom picker states
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [showPersonalityPicker, setShowPersonalityPicker] = useState(false);

  const { addPet, setOnboardingComplete } = useAppStore();

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
    if (currentCardIndex < ONBOARDING_STEPS.length - 1) {
      nextCard('right');
    } else {
      // Complete onboarding
      if (petForm.name) {
        const newPet: any = {
          id: Date.now().toString(),
          userId: '1',
          ...petForm,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addPet(newPet);
      }
      setOnboardingComplete(true);
    }
  };

  const handleSkip = () => {
    if (currentCardIndex < ONBOARDING_STEPS.length - 1) {
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

  // Interactive input handlers
  const toggleDailyTask = (task: string) => {
    setSelectedDailyTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const toggleRecurringTask = (task: string) => {
    setSelectedRecurringTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
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

  const openAgePicker = () => setShowAgePicker(true);
  const openGenderPicker = () => setShowGenderPicker(true);
  const openBreedPicker = () => setShowBreedPicker(true);
  const openPersonalityPicker = () => setShowPersonalityPicker(true);

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
        setCatPhoto(result.assets[0].uri);
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
        setCatPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const renderCardContent = (step: any) => {
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
                value={petForm.name}
                onChangeText={(text) => setPetForm(prev => ({ ...prev, name: text }))}
                autoFocus={false}
              />
            </View>
            <TouchableOpacity style={styles.avatarPlaceholder} onPress={pickImage}>
              {catPhoto ? (
                <Image source={{ uri: catPhoto }} style={styles.avatarImage} />
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
                    <Text style={styles.inputValue}>{petForm.gender.charAt(0).toUpperCase() + petForm.gender.slice(1)}</Text>
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
                    <Text style={styles.inputValue}>{petForm.breed || 'Select breed'}</Text>
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
                    <Text style={styles.inputValue}>{petForm.personality || 'Select personality'}</Text>
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
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
            <View style={styles.taskList}>
              {['Water intake', 'Feeding', 'Playtime activity', 'Poop consistency', 'Litter'].map((task) => (
                <TouchableOpacity 
                  key={task} 
                  style={styles.taskItem}
                  onPress={() => toggleDailyTask(task)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedDailyTasks.includes(task) && styles.checkboxSelected
                  ]}>
                    {selectedDailyTasks.includes(task) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.taskText}>{task}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'recurring_tasks':
        return (
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🔄</Text>
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDescription}>{step.description}</Text>
            <View style={styles.taskList}>
              {['Grooming', 'Tooth brushing', 'Nail clipping', 'Flea treatment', 'Showering', 'Internal deworming', 'Vet check-up'].map((task) => (
                <TouchableOpacity 
                  key={task} 
                  style={styles.taskItem}
                  onPress={() => toggleRecurringTask(task)}
                >
                  <View style={[
                    styles.checkbox,
                    selectedRecurringTasks.includes(task) && styles.checkboxSelected
                  ]}>
                    {selectedRecurringTasks.includes(task) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.taskText}>{task}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
            <View style={styles.timePicker}>
              <TouchableOpacity 
                style={styles.timeColumn}
                onPress={() => showHourPicker()}
              >
                <Text style={styles.timeLabel}>Hour</Text>
                <Text style={styles.timeValue}>{reminderTime.hour}</Text>
              </TouchableOpacity>
              <Text style={styles.timeSeparator}>:</Text>
              <TouchableOpacity 
                style={styles.timeColumn}
                onPress={() => showMinutePicker()}
              >
                <Text style={styles.timeLabel}>Minute</Text>
                <Text style={styles.timeValue}>{reminderTime.minute.toString().padStart(2, '0')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.timeColumn}
                onPress={() => togglePeriod()}
              >
                <Text style={styles.timeLabel}>Period</Text>
                <Text style={styles.timeValue}>{reminderTime.period}</Text>
              </TouchableOpacity>
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
  const onboardingComplete = currentCardIndex >= ONBOARDING_STEPS.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar 
          current={currentCardIndex + 1} 
          total={ONBOARDING_STEPS.length}
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
                {currentCardIndex === ONBOARDING_STEPS.length - 1 ? 'START' : 'NEXT'}
        </Text>
            </Animated.View>

            {ONBOARDING_STEPS
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
        onRequestClose={() => setShowAgePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowAgePicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Age</Text>
              <View style={{ width: 60 }} />
            </View>
            <View style={styles.wheelContainer}>
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Years</Text>
                <WheelPicker
                  items={Array.from({ length: 20 }, (_, i) => ({ label: i.toString(), value: i }))}
                  selectedIndex={selectedYear}
                  onSelectionChange={(index) => {
                    setSelectedYear(index);
                    const totalMonths = (index * 12) + selectedMonth;
                    setAgeMonths(totalMonths);
                    setPetForm(prev => ({ ...prev, age: index || 1 }));
                  }}
                />
              </View>
              
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Months</Text>
                <WheelPicker
                  items={Array.from({ length: 12 }, (_, i) => ({ label: i.toString(), value: i }))}
                  selectedIndex={selectedMonth}
                  onSelectionChange={(index) => {
                    setSelectedMonth(index);
                    const totalMonths = (selectedYear * 12) + index;
                    setAgeMonths(totalMonths);
                    setPetForm(prev => ({ ...prev, age: selectedYear || 1 }));
                  }}
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
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Gender</Text>
              <View style={{ width: 60 }} />
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
                    petForm.gender === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setPetForm(prev => ({ ...prev, gender: option.value as 'male' | 'female' | 'other' }));
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    petForm.gender === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {petForm.gender === option.value && (
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
        onRequestClose={() => setShowBreedPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowBreedPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Breed</Text>
              <View style={{ width: 60 }} />
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
                    petForm.breed === breed && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setPetForm(prev => ({ ...prev, breed }));
                    setShowBreedPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    petForm.breed === breed && styles.optionTextSelected
                  ]}>
                    {breed}
                  </Text>
                  {petForm.breed === breed && (
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
        onRequestClose={() => setShowPersonalityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowPersonalityPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
        </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Personality</Text>
              <View style={{ width: 60 }} />
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
                    petForm.personality === personality && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setPetForm(prev => ({ ...prev, personality }));
                    setShowPersonalityPicker(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    petForm.personality === personality && styles.optionTextSelected
                  ]}>
                    {personality}
          </Text>
                  {petForm.personality === personality && (
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
});

export default OnboardingScreen;
