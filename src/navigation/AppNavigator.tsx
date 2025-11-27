import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, StyleSheet, Text, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { RootStackParamList, MainTabParamList } from '../types';
import { initializeLanguage } from '../utils/i18n';

// Navigation icons (SVG for native)
import TasksScreenActiveSvg from '../assets/icons/tasks-screen-active.svg';
import TasksScreenInactiveSvg from '../assets/icons/tasks-screen-inactive.svg';
import PetsScreenActiveSvg from '../assets/icons/pets-screen-active.svg';
import PetsScreenInactiveSvg from '../assets/icons/pets-screen-inactive.svg';
import PaperPlaneIconSvg from '../assets/icons/paper-plane.svg';

// PNG icons for web
const WEB_NAV_ICONS = {
  tasksActive: require('../assets/icons-png/tasks-screen-active.png'),
  tasksInactive: require('../assets/icons-png/tasks-screen-inactive.png'),
  petsActive: require('../assets/icons-png/pets-screen-active.png'),
  petsInactive: require('../assets/icons-png/pets-screen-inactive.png'),
};

// Icon components - PNG on web, SVG on native
const NavIcon: React.FC<{ 
  activeSvg: React.FC<any>; 
  inactiveSvg: React.FC<any>;
  activePng: any;
  inactivePng: any;
  isActive: boolean; 
  size: number;
}> = ({ activeSvg: ActiveSvg, inactiveSvg: InactiveSvg, activePng, inactivePng, isActive, size }) => {
  if (Platform.OS === 'web') {
    return (
      <Image 
        source={isActive ? activePng : inactivePng}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }
  return isActive ? <ActiveSvg width={size} height={size} /> : <InactiveSvg width={size} height={size} />;
};

// Paper plane is a true vector SVG (no embedded images), so it works fine on web
const FloatingIcon: React.FC<{ size: number }> = ({ size }) => (
  <PaperPlaneIconSvg width={size} height={size} />
);

// Create context for active screen
const ActiveScreenContext = createContext<{
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}>({
  activeScreen: 'Tasks',
  setActiveScreen: () => {},
});

export const useActiveScreen = () => useContext(ActiveScreenContext);

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { activeScreen, setActiveScreen } = useActiveScreen();

  const navigateToCommunity = () => {
    setActiveScreen('Community');
    navigation.navigate('Community');
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.tabBarContent}>
          {/* Tasks Tab */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeScreen === 'Tasks' && styles.activeTabButton
            ]}
            onPress={() => {
              setActiveScreen('Tasks');
              navigation.navigate('Tasks');
            }}
          >
            <NavIcon
              activeSvg={TasksScreenActiveSvg}
              inactiveSvg={TasksScreenInactiveSvg}
              activePng={WEB_NAV_ICONS.tasksActive}
              inactivePng={WEB_NAV_ICONS.tasksInactive}
              isActive={activeScreen === 'Tasks'}
              size={24}
            />
            <Text style={[
              styles.tabLabel,
              { color: activeScreen === 'Tasks' ? '#FFFFFF' : '#18C07A' }
            ]}>
              Tasks
            </Text>
          </TouchableOpacity>

          {/* Pets Tab */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeScreen === 'PetProfiles' && styles.activeTabButton
            ]}
            onPress={() => {
              setActiveScreen('PetProfiles');
              navigation.navigate('PetProfiles');
            }}
          >
            <NavIcon
              activeSvg={PetsScreenActiveSvg}
              inactiveSvg={PetsScreenInactiveSvg}
              activePng={WEB_NAV_ICONS.petsActive}
              inactivePng={WEB_NAV_ICONS.petsInactive}
              isActive={activeScreen === 'PetProfiles'}
              size={24}
            />
            <Text style={[
              styles.tabLabel,
              { color: activeScreen === 'PetProfiles' ? '#FFFFFF' : '#18C07A' }
            ]}>
              Pets
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Community Button - Hide when on Community screen */}
      {activeScreen !== 'Community' && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={navigateToCommunity}
        >
          <FloatingIcon size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Import screens
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ManagePetScreen from '../screens/ManagePetScreen';
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
  const [activeScreen, setActiveScreen] = useState('Tasks');
  
  return (
    <ActiveScreenContext.Provider value={{ activeScreen, setActiveScreen }}>
      <Tab.Navigator
        initialRouteName="Tasks"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
            shadowColor: 'transparent',
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          },
          headerTitleStyle: {
            fontSize: 35,
            fontWeight: '600',
            fontFamily: 'LobsterTwo_400Regular',
            color: '#2C3E50',
          },
        }}
      >
        <Tab.Screen 
          name="Tasks" 
          component={TasksScreen}
          options={({ navigation }) => ({
            title: 'Tasks',
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerProfileButton}
                onPress={() => navigation.getParent()?.navigate('Profile')}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color="#2C3E50"
                />
              </TouchableOpacity>
            ),
          })}
        />
        <Tab.Screen 
          name="PetProfiles" 
          component={PetProfilesScreen}
          options={({ navigation }) => ({
            title: 'Pets',
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerProfileButton}
                onPress={() => navigation.getParent()?.navigate('Profile')}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color="#2C3E50"
                />
              </TouchableOpacity>
            ),
          })}
        />
        <Tab.Screen 
          name="Community" 
          component={CommunityScreen}
          options={({ navigation }) => ({
            title: 'Community',
            headerRight: () => (
              <TouchableOpacity
                style={styles.headerProfileButton}
                onPress={() => navigation.getParent()?.navigate('Profile')}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color="#2C3E50"
                />
              </TouchableOpacity>
            ),
          })}
        />
      </Tab.Navigator>
    </ActiveScreenContext.Provider>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isOnboardingComplete, user } = useAppStore();
  
  // Initialize language from user preference on app start
  useEffect(() => {
    if (user?.language) {
      initializeLanguage(user.language);
    }
  }, []); // Only run on mount

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontFamily: 'LobsterTwo_700Bold',
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
              name="Onboarding" 
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ManagePet" 
              component={ManagePetScreen}
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

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'relative',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
    height: 72,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#18C07A',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  floatingButton: {
    position: 'absolute',
    top: -30,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#18C07A',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  headerProfileButton: {
    marginRight: 16,
    padding: 4,
  },
});

export default AppNavigator;
