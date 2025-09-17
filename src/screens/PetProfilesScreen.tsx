import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { Pet } from '../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const PetProfilesScreen: React.FC = () => {
  const { pets, currentPet, setCurrentPet } = useAppStore();

  const renderPetCard = ({ item }: { item: Pet }) => {
    const isCurrentPet = currentPet?.id === item.id;
    
    return (
      <TouchableOpacity 
        style={[
          styles.petCard,
          isCurrentPet && styles.currentPetCard
        ]}
        onPress={() => setCurrentPet(item)}
      >
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
            {item.name}
          </Text>
          <Text style={styles.petBreed}>{item.breed}</Text>
          <Text style={styles.petAge}>{item.age} years old</Text>
          <Text style={styles.petGender}>
            {item.gender === 'male' ? '♂' : item.gender === 'female' ? '♀' : '⚧'} {item.gender}
          </Text>
        </View>

        <View style={styles.petStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
        </View>

        {isCurrentPet && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleAddPet = () => {
    // Navigate to add pet screen
    console.log('Add new pet');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cats</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
          <Text style={styles.addButtonText}>+ Add Cat</Text>
        </TouchableOpacity>
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
        <FlatList
          data={pets}
          renderItem={renderPetCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Quick Stats Summary */}
      {pets.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{pets.length}</Text>
            <Text style={styles.summaryLabel}>Cats</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {pets.reduce((total, pet) => total + 7, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Streak Days</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {pets.reduce((total, pet) => total + 42, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Logs</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  addButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    alignSelf: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  petInfo: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  petName: {
    ...TYPOGRAPHY.h3,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  petGender: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  petStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.small,
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
