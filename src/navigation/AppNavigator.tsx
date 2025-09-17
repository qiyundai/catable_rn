import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../store';
import { RootStackParamList, MainTabParamList } from '../types';

// Import screens
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TasksScreen from '../screens/TasksScreen';
import CommunityScreen from '../screens/CommunityScreen';
import PetProfilesScreen from '../screens/PetProfilesScreen';
import PetProfileScreen from '../screens/PetProfileScreen';
import LoggingScreen from '../screens/LoggingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import components
import TabBarIcon from '../components/TabBarIcon';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#7F8C8D',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E1E8ED',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E1E8ED',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#2C3E50',
        },
      })}
    >
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen 
        name="PetProfiles" 
        component={PetProfilesScreen}
        options={{ title: 'Pets' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isOnboardingComplete } = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#E1E8ED',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#2C3E50',
          },
          headerTintColor: '#2C3E50',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : !isOnboardingComplete ? (
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="PetProfile" 
              component={PetProfileScreen}
              options={{ title: 'Pet Profile' }}
            />
            <Stack.Screen 
              name="Logging" 
              component={LoggingScreen}
              options={{ title: 'Log Activity' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
