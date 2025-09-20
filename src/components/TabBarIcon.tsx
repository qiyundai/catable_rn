import React from 'react';
import { View, StyleSheet } from 'react-native';
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
    // Special center button with custom styling - always green
    return (
      <View style={[
        styles.centerButton,
        { backgroundColor: '#18C07A' }
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
    <Ionicons
      name={focused ? getIconNameFilled() : getIconName()}
      size={size}
      color={color}
    />
  );
};

const styles = StyleSheet.create({
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default TabBarIcon;
