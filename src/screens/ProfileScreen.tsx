import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, TextInput, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING, REGION_OPTIONS } from '../constants';
import WheelPicker from '../components/WheelPicker';
import NotificationService from '../services/NotificationService';

const ProfileScreen: React.FC = () => {
  const { user, setUser, signOut, userTasks, setUserTasks, taskReminderState, pets } = useAppStore();
  const [userPhoto, setUserPhoto] = useState<string | null>(user?.avatar || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [editedUser, setEditedUser] = useState({
    userName: user?.userName || '',
    email: user?.email || '',
    region: user?.region || '',
  });

  // Reminder time management states
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [tempReminderTime, setTempReminderTime] = useState({
    hour: userTasks?.reminderTime?.hour || 9,
    minute: userTasks?.reminderTime?.minute || 0,
    period: userTasks?.reminderTime?.period || 'AM' as 'AM' | 'PM',
  });

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

  // Update photo when user changes
  React.useEffect(() => {
    setUserPhoto(user?.avatar || null);
    if (user) {
      setEditedUser({
        userName: user.userName || '',
        email: user.email || '',
        region: user.region || '',
      });
    }
  }, [user]);

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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setUserPhoto(imageUri);
        
        // Update user in store
        if (user) {
          setUser({
            ...user,
            avatar: imageUri,
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = () => {
    if (!editedUser.userName.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    if (!editedUser.email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (user) {
      setUser({
        ...user,
        userName: editedUser.userName.trim(),
        email: editedUser.email.trim(),
        region: editedUser.region.trim(),
        updatedAt: new Date(),
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({
        userName: user.userName || '',
        email: user.email || '',
        region: user.region || '',
      });
    }
    setIsEditing(false);
  };

  const handleRegionSelect = (region: string) => {
    setEditedUser({ ...editedUser, region });
    setShowRegionPicker(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
          },
        },
      ]
    );
  };

  // Reminder time handlers
  const openReminderTimePicker = () => {
    setTempReminderTime({
      hour: userTasks?.reminderTime?.hour || 9,
      minute: userTasks?.reminderTime?.minute || 0,
      period: userTasks?.reminderTime?.period || 'AM',
    });
    setShowReminderTimePicker(true);
  };

  const cancelReminderTimePicker = () => {
    setShowReminderTimePicker(false);
  };

  const saveReminderTimePicker = async () => {
    if (!userTasks) {
      Alert.alert('Error', 'No tasks configured yet');
      setShowReminderTimePicker(false);
      return;
    }

    try {
      // Update user tasks with new reminder time
      const updatedTasks = {
        ...userTasks,
        reminderTime: tempReminderTime,
      };
      setUserTasks(updatedTasks);

      // Cancel all existing task reminders to prevent double notifications
      await NotificationService.cancelAllReminders();

      // Reschedule with new time
      const petName = pets.length > 0 ? pets[0].name : 'your cat';
      await NotificationService.rescheduleTaskReminders(
        updatedTasks,
        taskReminderState,
        petName
      );

      setShowReminderTimePicker(false);
      Alert.alert('Success', 'Reminder time updated successfully');
    } catch (error) {
      console.error('Error updating reminder time:', error);
      Alert.alert('Error', 'Failed to update reminder time');
    }
  };

  const formatReminderTime = () => {
    if (!userTasks?.reminderTime) return 'Not set';
    const { hour, minute, period } = userTasks.reminderTime;
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-circle" size={80} color={COLORS.primary} />
            )}
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>User Information</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Ionicons name="checkmark" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={24} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Username</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedUser.userName}
                  onChangeText={(text) => setEditedUser({ ...editedUser, userName: text })}
                  placeholder="Enter username"
                  placeholderTextColor={COLORS.textSecondary}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {user?.userName || 'Not set'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedUser.email}
                  onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                  placeholder="Enter email"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {user?.email || 'Not set'}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.infoItem, styles.lastInfoItem]}>
            <Ionicons name="location-outline" size={24} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Region</Text>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.regionButton}
                  onPress={() => setShowRegionPicker(true)}
                >
                  <Text style={[
                    styles.regionButtonText,
                    !editedUser.region && styles.regionButtonTextPlaceholder
                  ]}>
                    {editedUser.region || 'Select region'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>
                  {user?.region || 'Not set'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Notifications & Reminders Section */}
        {userTasks && (
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notifications & Reminders</Text>
            </View>

            <TouchableOpacity 
              style={styles.infoItem}
              onPress={openReminderTimePicker}
            >
              <Ionicons name="alarm-outline" size={24} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Daily Reminder Time</Text>
                <View style={styles.reminderTimeRow}>
                  <Text style={styles.infoValue}>{formatReminderTime()}</Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>

            <View style={[styles.infoItem, styles.lastInfoItem]}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Note</Text>
                <Text style={styles.infoNote}>
                  You'll receive one daily reminder at this time to complete your tasks
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Region Picker Modal */}
      <Modal
        visible={showRegionPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRegionPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowRegionPicker(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Region</Text>
              <TouchableOpacity onPress={() => setShowRegionPicker(false)}>
                <Text style={styles.pickerSaveText}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={true}>
              {REGION_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    editedUser.region === option.value && styles.optionItemSelected
                  ]}
                  onPress={() => handleRegionSelect(option.value)}
                >
                  <Text style={[
                    styles.optionText,
                    editedUser.region === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {editedUser.region === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reminder Time Picker Modal */}
      <Modal
        visible={showReminderTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelReminderTimePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={cancelReminderTimePicker}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Set Reminder Time</Text>
              <TouchableOpacity onPress={saveReminderTimePicker}>
                <Text style={styles.pickerSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wheelContainer}>
              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Hour</Text>
                <WheelPicker
                  items={hourOptions}
                  selectedIndex={hourOptions.findIndex(opt => opt.value === tempReminderTime.hour)}
                  onSelectionChange={(index) => setTempReminderTime(prev => ({
                    ...prev,
                    hour: hourOptions[index].value
                  }))}
                />
              </View>

              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Minute</Text>
                <WheelPicker
                  items={minuteOptions}
                  selectedIndex={minuteOptions.findIndex(opt => opt.value === tempReminderTime.minute)}
                  onSelectionChange={(index) => setTempReminderTime(prev => ({
                    ...prev,
                    minute: minuteOptions[index].value
                  }))}
                />
              </View>

              <View style={styles.wheelColumn}>
                <Text style={styles.wheelLabel}>Period</Text>
                <WheelPicker
                  items={periodOptions}
                  selectedIndex={tempReminderTime.period === 'AM' ? 0 : 1}
                  onSelectionChange={(index) => setTempReminderTime(prev => ({
                    ...prev,
                    period: periodOptions[index].value === 0 ? 'AM' : 'PM'
                  }))}
                />
              </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    padding: SPACING.xs,
  },
  saveButton: {
    padding: SPACING.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastInfoItem: {
    borderBottomWidth: 0,
  },
  infoContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  input: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: 0,
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: 0,
  },
  regionButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  regionButtonTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  signOutButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  signOutText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
    fontWeight: '600',
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
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
});

export default ProfileScreen;
