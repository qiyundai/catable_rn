import { Pet } from '../types';

/**
 * Calculate the current age of a pet in months
 * Takes into account the age when added and time elapsed since then
 */
export const calculateCurrentAgeInMonths = (pet: Pet): number => {
  // Age when the pet was added
  const ageWhenAdded = pet.ageMonths;
  
  // Calculate months elapsed since the pet was added
  const createdAt = new Date(pet.createdAt);
  const now = new Date();
  
  const yearsDiff = now.getFullYear() - createdAt.getFullYear();
  const monthsDiff = now.getMonth() - createdAt.getMonth();
  
  const monthsElapsed = (yearsDiff * 12) + monthsDiff;
  
  // Current age = age when added + months elapsed
  return ageWhenAdded + monthsElapsed;
};

/**
 * Format pet age in a human-readable format
 */
export const formatPetAge = (pet: Pet): string => {
  const totalMonths = calculateCurrentAgeInMonths(pet);
  
  if (totalMonths < 0) {
    return 'Unknown age';
  }
  
  if (totalMonths < 12) {
    return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
  } else if (totalMonths === 12) {
    return '1 year';
  } else {
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  }
};

/**
 * Calculate estimated birthdate based on current age and when pet was added
 */
export const calculateEstimatedBirthdate = (pet: Pet): Date => {
  const currentAgeInMonths = calculateCurrentAgeInMonths(pet);
  const now = new Date();
  
  const birthdate = new Date(now);
  birthdate.setMonth(birthdate.getMonth() - currentAgeInMonths);
  
  return birthdate;
};

