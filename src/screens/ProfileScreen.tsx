import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAppStore();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={24} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>
                {user?.displayName || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {user?.email || 'Not set'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={24} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>
                {user?.region || 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          <Text style={styles.signOutText}>Sign Out</Text>
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
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
});

export default ProfileScreen;
