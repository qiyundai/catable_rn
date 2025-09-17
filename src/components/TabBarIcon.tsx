import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabBarIconProps {
  route: string;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  const getIconName = () => {
    switch (route) {
      case 'Tasks':
        return 'list-outline';
      case 'Community':
        return 'paper-plane-outline';
      case 'PetProfiles':
        return 'paw-outline';
      default:
        return 'help-outline';
    }
  };

  const getIconNameFilled = () => {
    switch (route) {
      case 'Tasks':
        return 'list';
      case 'Community':
        return 'paper-plane';
      case 'PetProfiles':
        return 'paw';
      default:
        return 'help';
    }
  };

  if (route === 'Community') {
    // Special center button with custom styling
    return (
      <View style={[
        styles.centerButton,
        { backgroundColor: focused ? '#FF6B6B' : '#4ECDC4' }
      ]}>
        <Ionicons
          name={focused ? getIconNameFilled() : getIconName()}
          size={size + 4}
          color="#FFFFFF"
        />
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={focused ? getIconNameFilled() : getIconName()}
        size={size}
        color={color}
      />
      <Text style={[styles.label, { color }]}>
        {route === 'PetProfiles' ? 'Pets' : route}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
});

export default TabBarIcon;
