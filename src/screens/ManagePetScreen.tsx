import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppStore } from '../store';
import { PetForm, RootStackParamList } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import WheelPicker from '../components/WheelPicker';

const { width: screenWidth } = Dimensions.get('window');

type ManagePetScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagePet'>;
type ManagePetScreenRouteProp = RouteProp<RootStackParamList, 'ManagePet'>;

const ManagePetScreen: React.FC = () => {
  const navigation = useNavigation<ManagePetScreenNavigationProp>();
  const route = useRoute<ManagePetScreenRouteProp>();
  const { addPet, updatePet, pets } = useAppStore();
  
  const { petId } = route.params || {};
  const isEditing = !!petId;
  const existingPet = petId ? pets.find(pet => pet.id === petId) : null;
  
  const [petForm, setPetForm] = useState<PetForm>(() => {
    if (existingPet) {
      return {
        name: existingPet.name || '',
        breed: existingPet.breed || '',
        ageMonths: existingPet.ageMonths || 12,
        gender: existingPet.gender || 'other',
        personality: existingPet.personality || '',
      };
    }
    return {
      name: '',
      breed: '',
      ageMonths: 12,
      gender: 'other',
      personality: '',
    };
  });
  
  const [catPhoto, setCatPhoto] = useState<string | null>(existingPet?.avatar || null);
  const [ageMonths, setAgeMonths] = useState(existingPet?.ageMonths || 12);
  
  // Calculate years and months from ageMonths
  const initialYears = Math.floor((existingPet?.ageMonths || 12) / 12);
  const initialMonths = (existingPet?.ageMonths || 12) % 12;
  
  const [selectedYear, setSelectedYear] = useState(initialYears);
  const [selectedMonth, setSelectedMonth] = useState(initialMonths);
  
  // Custom picker states
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [showPersonalityPicker, setShowPersonalityPicker] = useState(false);

  // Initialize age values when component mounts or when existingPet changes
  React.useEffect(() => {
    if (existingPet) {
      const years = Math.floor(existingPet.ageMonths / 12);
      const months = existingPet.ageMonths % 12;
      setSelectedYear(years);
      setSelectedMonth(months);
    }
  }, [existingPet]);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const breedOptions = [
    { label: 'Mixed', value: 'Mixed' },
    { label: 'Persian', value: 'Persian' },
    { label: 'Maine Coon', value: 'Maine Coon' },
    { label: 'Siamese', value: 'Siamese' },
    { label: 'British Shorthair', value: 'British Shorthair' },
    { label: 'Ragdoll', value: 'Ragdoll' },
    { label: 'American Shorthair', value: 'American Shorthair' },
    { label: 'Scottish Fold', value: 'Scottish Fold' },
    { label: 'Other', value: 'Other' },
  ];

  const personalityOptions = [
    { label: 'Playful', value: 'Playful' },
    { label: 'Calm', value: 'Calm' },
    { label: 'Energetic', value: 'Energetic' },
    { label: 'Independent', value: 'Independent' },
    { label: 'Affectionate', value: 'Affectionate' },
    { label: 'Curious', value: 'Curious' },
    { label: 'Shy', value: 'Shy' },
    { label: 'Social', value: 'Social' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCatPhoto(result.assets[0].uri);
    }
  };

  const updatePetForm = (updates: Partial<PetForm>) => {
    setPetForm(prev => ({ ...prev, ...updates }));
  };

  const saveAgePicker = () => {
    setSelectedYear(tempSelectedYear);
    setSelectedMonth(tempSelectedMonth);
    const totalMonths = (tempSelectedYear * 12) + tempSelectedMonth;
    setAgeMonths(totalMonths);
    updatePetForm({ ageMonths: totalMonths });
    setShowAgePicker(false);
  };

  const [tempSelectedYear, setTempSelectedYear] = useState(0);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(0);

  // Initialize temp values for pickers when editing or when values change
  React.useEffect(() => {
    setTempSelectedYear(selectedYear);
    setTempSelectedMonth(selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Update temp values when opening the age picker
  const openAgePicker = () => {
    setTempSelectedYear(selectedYear);
    setTempSelectedMonth(selectedMonth);
    setShowAgePicker(true);
  };

  const handleSave = () => {
    if (!petForm.name.trim()) {
      Alert.alert('Error', 'Please enter your cat\'s name');
      return;
    }

    if (!petForm.breed) {
      Alert.alert('Error', 'Please select your cat\'s breed');
      return;
    }

    if (!petForm.personality) {
      Alert.alert('Error', 'Please select your cat\'s personality');
      return;
    }

    if (isEditing && petId) {
      // Update existing pet
      updatePet(petId, {
        ...petForm,
        avatar: catPhoto || undefined,
        updatedAt: new Date(),
      });
    } else {
      // Create new pet
      const newPet = {
        id: Date.now().toString(),
        userId: '1',
        ...petForm,
        avatar: catPhoto || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addPet(newPet);
    }
    
    // Navigate back to pet profiles
    navigation.goBack();
  };

  const renderFormField = (label: string, value: string, onPress: () => void, placeholder?: string) => (
    <TouchableOpacity style={styles.formField} onPress={onPress}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formFieldContent}>
        <Text style={[styles.formFieldText, !value && styles.placeholderText]}>
          {value || placeholder || 'Select...'}
        </Text>
        <Text style={styles.formFieldArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEditing ? 'Edit Cat' : 'Add New Cat'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {catPhoto ? (
                <Image source={{ uri: catPhoto }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>📷</Text>
                  <Text style={styles.avatarPlaceholderLabel}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Cat's Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your cat's name"
              value={petForm.name}
              onChangeText={(text) => updatePetForm({ name: text })}
              autoCapitalize="words"
            />
          </View>

          {/* Form Fields */}
          {renderFormField(
            'Age *',
            selectedYear > 0 || selectedMonth > 0 ? `${selectedYear} year${selectedYear !== 1 ? 's' : ''} ${selectedMonth} month${selectedMonth !== 1 ? 's' : ''}` : '',
            openAgePicker
          )}

          {renderFormField(
            'Gender *',
            genderOptions.find(opt => opt.value === petForm.gender)?.label || petForm.gender || '',
            () => setShowGenderPicker(true)
          )}

          {renderFormField(
            'Breed *',
            breedOptions.find(opt => opt.value === petForm.breed)?.label || petForm.breed || '',
            () => setShowBreedPicker(true)
          )}

          {renderFormField(
            'Personality *',
            personalityOptions.find(opt => opt.value === petForm.personality)?.label || petForm.personality || '',
            () => setShowPersonalityPicker(true)
          )}
        </View>
      </ScrollView>

      {/* Age Picker Modal */}
      {showAgePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowAgePicker(false)}>
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
      )}

      {/* Gender Picker Modal */}
      {showGenderPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {genderOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    petForm.gender === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => updatePetForm({ gender: option.value as any })}
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
      )}

      {/* Breed Picker Modal */}
      {showBreedPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowBreedPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Breed</Text>
              <TouchableOpacity onPress={() => setShowBreedPicker(false)}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {breedOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    petForm.breed === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => updatePetForm({ breed: option.value })}
                >
                  <Text style={[
                    styles.optionText,
                    petForm.breed === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {petForm.breed === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Personality Picker Modal */}
      {showPersonalityPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowPersonalityPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Personality</Text>
              <TouchableOpacity onPress={() => setShowPersonalityPicker(false)}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {personalityOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    petForm.personality === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => updatePetForm({ personality: option.value })}
                >
                  <Text style={[
                    styles.optionText,
                    petForm.personality === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {petForm.personality === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelButton: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  saveButton: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  avatarPlaceholderLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
  },
  formField: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  formLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  formFieldContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formFieldText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.disabled,
  },
  formFieldArrow: {
    ...TYPOGRAPHY.h3,
    color: COLORS.disabled,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.large,
    width: screenWidth * 0.9,
    maxHeight: '80%',
    ...SHADOWS.large,
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
    color: COLORS.text,
  },
  pickerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  pickerSaveText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
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
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
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
  },
});

export default ManagePetScreen;
