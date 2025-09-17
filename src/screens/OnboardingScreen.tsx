import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { PetForm } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, ONBOARDING_STEPS } from '../constants';

const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [petForm, setPetForm] = useState<PetForm>({
    name: '',
    breed: '',
    age: 1,
    gender: 'other',
    personality: '',
  });
  const [selectedDailyTasks, setSelectedDailyTasks] = useState<string[]>([]);
  const [selectedRecurringTasks, setSelectedRecurringTasks] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState({ hour: 9, minute: 0, period: 'AM' });

  const { addPet, setOnboardingComplete } = useAppStore();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
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
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingComplete(true);
    }
  };

  const renderStepContent = () => {
    const step = ONBOARDING_STEPS[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.illustration}>
              <Text style={styles.illustrationEmoji}>🐱</Text>
            </View>
          </View>
        );

      case 'cat_name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cat's Name</Text>
              <Text style={styles.inputPlaceholder}>Enter your cat's name</Text>
            </View>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>📷</Text>
              <Text style={styles.avatarText}>Add Photo</Text>
            </View>
          </View>
        );

      case 'cat_info':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>1 year</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>Other</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Breed</Text>
                <Text style={styles.infoValue}>Mixed</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Personality</Text>
                <Text style={styles.infoValue}>Playful</Text>
              </View>
            </View>
          </View>
        );

      case 'add_another':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.illustration}>
              <Text style={styles.illustrationEmoji}>🐱🐱</Text>
            </View>
          </View>
        );

      case 'logging_goals':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.illustration}>
              <Text style={styles.illustrationEmoji}>🎯</Text>
            </View>
          </View>
        );

      case 'daily_tasks':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.taskList}>
              {['Water intake', 'Feeding', 'Playtime activity', 'Poop consistency', 'Litter'].map((task) => (
                <View key={task} style={styles.taskItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'recurring_tasks':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.taskList}>
              {['Grooming', 'Tooth brushing', 'Nail clipping', 'Flea treatment', 'Showering', 'Internal deworming', 'Vet check-up'].map((task) => (
                <View key={task} style={styles.taskItem}>
                  <View style={styles.checkbox} />
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'reminder_time':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.timePicker}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Hour</Text>
                <Text style={styles.timeValue}>9</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Minute</Text>
                <Text style={styles.timeValue}>00</Text>
              </View>
              <View style={styles.timeColumn}>
                <Text style={styles.timeLabel}>Period</Text>
                <Text style={styles.timeValue}>AM</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {ONBOARDING_STEPS.length}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.contentContainer}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Yes'}
          </Text>
        </TouchableOpacity>
      </View>
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
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  stepDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  illustrationEmoji: {
    fontSize: 48,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
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
  infoGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  taskList: {
    width: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SPACING.md,
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
  buttonContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  skipButton: {
    flex: 1,
    padding: SPACING.md,
    marginRight: SPACING.sm,
  },
  skipButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    marginLeft: SPACING.sm,
  },
  nextButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default OnboardingScreen;
