import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  LayoutAnimation,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store';
import { Pet } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';

type PetProfilesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PetProfilesScreen: React.FC = () => {
  const { pets, currentPet, setCurrentPet } = useAppStore();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const navigation = useNavigation<PetProfilesScreenNavigationProp>();

  const formatAge = (pet: Pet) => {
    // Handle both old format (age) and new format (ageMonths)
    let months: number;
    if (pet.ageMonths !== undefined) {
      months = pet.ageMonths;
    } else {
      return 'Unknown age';
    }

    if (isNaN(months) || months < 0) {
      return 'Unknown age';
    }

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

  // Generate mock monthly data for the pet
  const generateMonthlyData = (petId: string) => {
    // In a real app, this would come from the database
    return {
      'Feeding': '28/30 days',
      'Peeing Frequency': '4.2 times/day',
      'Poop Consistency': 'Normal (85%)',
      'Activity': 'Moderate (3.1/5)',
      'Grooming': '6 times',
      'Sleep Breathing Frequency': '2 times',
      'Last Nail Clipping': '2 weeks ago',
      'Last Flea Treatment': '3 weeks ago',
      'Last Internal Deworming': '1 month ago',
      'Last Vet Visit': '2 months ago',
    };
  };

  const toggleExpanded = (petId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCardId(expandedCardId === petId ? null : petId);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Export report functionality not implemented yet');
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
             <Text style={styles.petAge}>🗓️ {formatAge(item)}</Text>
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
              style={styles.exportButton}
              onPress={handleExportReport}
            >
              <Text style={styles.exportButtonText}>Export Report</Text>
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
    // Navigate to manage pet screen
    navigation.getParent()?.navigate('ManagePet');
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
