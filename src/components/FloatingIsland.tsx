import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { COLORS, SPACING } from '../constants';

interface FloatingIslandProps {
  islandData?: any; // Island data for customization
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FloatingIsland: React.FC<FloatingIslandProps> = ({ islandData, style }) => {
  // Animation values using standard React Native Animated
  const floatAnimation = useRef(new Animated.Value(0)).current;
  const sunRotation = useRef(new Animated.Value(0)).current;
  const cat1Animation = useRef(new Animated.Value(0)).current;
  const cat2Animation = useRef(new Animated.Value(0)).current;
  const cat3Animation = useRef(new Animated.Value(0)).current;
  const sunRaysAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start all animations
    const startFloatAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const startSunRotation = () => {
      Animated.loop(
        Animated.timing(sunRotation, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    };

    const startSunRaysAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sunRaysAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(sunRaysAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const startCatAnimations = () => {
      // Cat 1 animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(cat1Animation, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(cat1Animation, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Cat 2 animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(cat2Animation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(cat2Animation, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Cat 3 animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(cat3Animation, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(cat3Animation, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloatAnimation();
    startSunRotation();
    startSunRaysAnimation();
    startCatAnimations();
  }, []);

  // Animated styles using standard React Native Animated
  const islandStyle = {
    transform: [
      {
        translateY: floatAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
    ],
  };

  const sunStyle = {
    transform: [
      {
        rotate: sunRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const sunRaysStyle = {
    transform: [
      {
        scale: sunRaysAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
    opacity: sunRaysAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    }),
  };

  const cat1Style = {
    transform: [
      {
        translateX: cat1Animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 20],
        }),
      },
      {
        translateY: cat1Animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
      {
        rotate: cat1Animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '15deg'],
        }),
      },
    ],
  };

  const cat2Style = {
    transform: [
      {
        translateX: cat2Animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
      {
        translateY: cat2Animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 8],
        }),
      },
      {
        rotate: cat2Animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-10deg'],
        }),
      },
    ],
  };

  const cat3Style = {
    transform: [
      {
        translateX: cat3Animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 25],
        }),
      },
      {
        translateY: cat3Animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
      {
        rotate: cat3Animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-20deg'],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.islandContainer, islandStyle]}>
        {/* Sun with rays */}
        <Animated.View style={[styles.sunContainer, sunStyle]}>
          <Animated.View style={[styles.sunRays, sunRaysStyle]} />
          <View style={styles.sun} />
        </Animated.View>

        {/* Floating Island */}
        <View style={styles.islandBase}>
          {/* Island shadow */}
          <View style={styles.islandShadow} />
          
          {/* Grass texture */}
          <View style={styles.grass1} />
          <View style={styles.grass2} />
          <View style={styles.grass3} />
          <View style={styles.grass4} />
          
          {/* Cats */}
          <Animated.View style={[styles.cat1, cat1Style]}>
            <View style={styles.catBody} />
            <View style={styles.catHead} />
            <View style={styles.catEars} />
            <View style={styles.catEarsRight} />
            <View style={styles.catEyes} />
            <View style={styles.catEyesRight} />
            <View style={styles.catNose} />
            <View style={styles.catTail} />
          </Animated.View>

          <Animated.View style={[styles.cat2, cat2Style]}>
            <View style={styles.catBody} />
            <View style={styles.catHead} />
            <View style={styles.catEars} />
            <View style={styles.catEarsRight} />
            <View style={styles.catEyes} />
            <View style={styles.catEyesRight} />
            <View style={styles.catNose} />
            <View style={styles.catTail} />
          </Animated.View>

          <Animated.View style={[styles.cat3, cat3Style]}>
            <View style={styles.catBody} />
            <View style={styles.catHead} />
            <View style={styles.catEars} />
            <View style={styles.catEarsRight} />
            <View style={styles.catEyes} />
            <View style={styles.catEyesRight} />
            <View style={styles.catNose} />
            <View style={styles.catTail} />
          </Animated.View>

          {/* Island details */}
          <View style={styles.tree1}>
            <View style={styles.tree1Trunk} />
            <View style={styles.tree1Leaves} />
          </View>
          <View style={styles.tree2}>
            <View style={styles.tree2Trunk} />
            <View style={styles.tree2Leaves} />
          </View>
          <View style={styles.rock1} />
          <View style={styles.rock2} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  islandContainer: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Sun styles
  sunContainer: {
    position: 'absolute',
    top: -40,
    right: 20,
    zIndex: 10,
  },
  sunRays: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    top: -20,
    left: -20,
  },
  sun: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 0px 20px rgba(255, 215, 0, 0.8)',
      },
    }),
  },
  // Island styles
  islandBase: {
    width: '100%',
    height: '80%',
    backgroundColor: '#8B4513',
    borderRadius: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    // Add gradient-like effect with multiple layers
    borderWidth: 3,
    borderColor: '#A0522D',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  islandShadow: {
    position: 'absolute',
    bottom: -20,
    left: '10%',
    right: '10%',
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 50,
    transform: [{ scaleX: 1.2 }],
  },
  // Cat styles
  cat1: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    width: 40,
    height: 30,
  },
  cat2: {
    position: 'absolute',
    bottom: 35,
    right: 50,
    width: 35,
    height: 28,
  },
  cat3: {
    position: 'absolute',
    bottom: 25,
    left: '50%',
    marginLeft: -18,
    width: 32,
    height: 24,
  },
  catBody: {
    width: '80%',
    height: '50%',
    backgroundColor: '#FF8C00',
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: '10%',
  },
  catHead: {
    width: '60%',
    height: '60%',
    backgroundColor: '#FF8C00',
    borderRadius: 50,
    position: 'absolute',
    top: 0,
    left: '20%',
  },
  catEars: {
    position: 'absolute',
    top: -5,
    left: '15%',
    width: 8,
    height: 12,
    backgroundColor: '#FF8C00',
    borderRadius: 4,
    transform: [{ rotate: '-20deg' }],
  },
  catEarsRight: {
    position: 'absolute',
    top: -5,
    right: '15%',
    width: 8,
    height: 12,
    backgroundColor: '#FF8C00',
    borderRadius: 4,
    transform: [{ rotate: '20deg' }],
  },
  catTail: {
    width: 6,
    height: 25,
    backgroundColor: '#FF8C00',
    borderRadius: 3,
    position: 'absolute',
    right: -8,
    top: '15%',
    transform: [{ rotate: '25deg' }],
  },
  catEyes: {
    position: 'absolute',
    top: '35%',
    left: '25%',
    width: 4,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  catEyesRight: {
    position: 'absolute',
    top: '35%',
    right: '25%',
    width: 4,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  catNose: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    width: 3,
    height: 3,
    backgroundColor: '#FF69B4',
    borderRadius: 1.5,
  },
  // Island details
  tree1: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 20,
    height: 30,
  },
  tree1Trunk: {
    position: 'absolute',
    bottom: 0,
    left: '40%',
    width: 4,
    height: 12,
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
  tree1Leaves: {
    position: 'absolute',
    top: 0,
    left: '10%',
    width: '80%',
    height: '70%',
    backgroundColor: '#228B22',
    borderRadius: 10,
  },
  tree2: {
    position: 'absolute',
    top: 15,
    right: 40,
    width: 16,
    height: 25,
  },
  tree2Trunk: {
    position: 'absolute',
    bottom: 0,
    left: '40%',
    width: 3,
    height: 10,
    backgroundColor: '#8B4513',
    borderRadius: 1.5,
  },
  tree2Leaves: {
    position: 'absolute',
    top: 0,
    left: '15%',
    width: '70%',
    height: '65%',
    backgroundColor: '#32CD32',
    borderRadius: 8,
  },
  rock1: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    width: 20,
    height: 12,
    backgroundColor: '#696969',
    borderRadius: 10,
  },
  rock2: {
    position: 'absolute',
    bottom: 20,
    right: 25,
    width: 15,
    height: 10,
    backgroundColor: '#A9A9A9',
    borderRadius: 7,
  },
  // Grass details
  grass1: {
    position: 'absolute',
    top: '60%',
    left: '20%',
    width: 8,
    height: 12,
    backgroundColor: '#90EE90',
    borderRadius: 4,
    transform: [{ rotate: '-10deg' }],
  },
  grass2: {
    position: 'absolute',
    top: '65%',
    left: '30%',
    width: 6,
    height: 10,
    backgroundColor: '#98FB98',
    borderRadius: 3,
    transform: [{ rotate: '15deg' }],
  },
  grass3: {
    position: 'absolute',
    top: '70%',
    right: '25%',
    width: 7,
    height: 11,
    backgroundColor: '#90EE90',
    borderRadius: 3.5,
    transform: [{ rotate: '-5deg' }],
  },
  grass4: {
    position: 'absolute',
    top: '55%',
    right: '35%',
    width: 5,
    height: 9,
    backgroundColor: '#98FB98',
    borderRadius: 2.5,
    transform: [{ rotate: '20deg' }],
  },
});

export default FloatingIsland;
