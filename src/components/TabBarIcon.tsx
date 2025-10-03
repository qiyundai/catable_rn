import React from 'react';
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
      case 'PetProfiles':
        return 'paw';
      default:
        return 'help';
    }
  };

  return (
    <Ionicons
      name={focused ? getIconNameFilled() : getIconName()}
      size={size}
      color={color}
    />
  );
};

export default TabBarIcon;
