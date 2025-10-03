import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const { width, height } = Dimensions.get('window');

const CommunityScreen: React.FC = () => {
  const { currentPet, pets } = useAppStore();
  const [message, setMessage] = useState('');
  const [currentIsland, setCurrentIsland] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [myIslandMessages, setMyIslandMessages] = useState([
    { id: '1', text: 'Hello from my floating island! 🐱', timestamp: '2m ago' },
    { id: '2', text: 'My cat is so playful today! 🎾', timestamp: '5m ago' },
  ]);
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height - 72)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const islands = [
    { 
      id: 0, 
      name: 'My Island', 
      owner: 'You', 
      cats: pets,
      messages: myIslandMessages
    },
    { 
      id: 1, 
      name: 'Luna\'s Island', 
      owner: 'Sarah', 
      cats: [{ name: 'Luna', avatar: '🐱' }],
      messages: [
        { id: '3', text: 'Luna had a great day playing! 🎾', timestamp: '1h ago' },
      ]
    },
    { 
      id: 2, 
      name: 'Whiskers\' Island', 
      owner: 'Mike', 
      cats: [{ name: 'Whiskers', avatar: '😸' }],
      messages: [
        { id: '4', text: 'Whiskers is being extra cuddly today 🥰', timestamp: '3h ago' },
      ]
    },
    { 
      id: 3, 
      name: 'Shadow\'s Island', 
      owner: 'Emma', 
      cats: [{ name: 'Shadow', avatar: '🐈' }],
      messages: [
        { id: '5', text: 'Shadow found a new hiding spot! 🕳️', timestamp: '6h ago' },
      ]
    },
  ];

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      animateButtonPress();
      const newMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        timestamp: 'now',
      };
      // Add message to "My Island" only
      if (currentIsland === 0) {
        setMyIslandMessages(prev => [newMessage, ...prev]);
      }
      setMessage('');
    }
  };

  const renderFloatingIsland = (island: any) => {
    return (
      <View key={island.id} style={styles.island}>
        <View style={styles.islandHeader}>
          <Text style={styles.islandName}>{island.name}</Text>
          <Text style={styles.islandOwner}>by {island.owner}</Text>
        </View>
        
        <View style={styles.catsContainer}>
          {island.cats.map((cat: any, index: number) => (
            <View key={index} style={styles.catAvatar}>
              <Text style={styles.catEmoji}>{cat.avatar || '🐱'}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
            </View>
          ))}
        </View>

        {/* Latest message for this island */}
        {island.messages.length > 0 && (
          <View style={styles.messageBubbles}>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>{island.messages[0].text}</Text>
              <Text style={styles.messageTime}>{island.messages[0].timestamp}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContent}>
          {/* Island Navigation */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setCurrentIsland(Math.max(0, currentIsland - 1))}
              disabled={currentIsland === 0}
            >
              <Text style={[
                styles.navButtonText,
                currentIsland === 0 && styles.disabledNavButton
              ]}>
                ←
              </Text>
            </TouchableOpacity>
            
            <View style={styles.islandInfo}>
              <Text style={styles.currentIslandName}>{islands[currentIsland].name}</Text>
              <Text style={styles.currentIslandOwner}>by {islands[currentIsland].owner}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => setCurrentIsland(Math.min(islands.length - 1, currentIsland + 1))}
              disabled={currentIsland === islands.length - 1}
            >
              <Text style={[
                styles.navButtonText,
                currentIsland === islands.length - 1 && styles.disabledNavButton
              ]}>
                →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Island */}
          <View style={[styles.islandsContainer, { marginBottom: keyboardHeight }]}>
            {renderFloatingIsland(islands[currentIsland])}
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Message Input - Only show for "My Island" */}
      {currentIsland === 0 && (
        <View style={[styles.messageInputContainer, { bottom: keyboardHeight }]}>
          <View style={styles.messageInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Share something about your cat..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={200}
            />
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  !message.trim() && styles.disabledSendButton
                ]}
                onPress={handleSendMessage}
                disabled={!message.trim()}
              >
                <Ionicons
                  name="paper-plane"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </Animated.View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  disabledNavButton: {
    color: COLORS.disabled,
  },
  islandInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  currentIslandName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  currentIslandOwner: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  islandsContainer: {
    flex: 1,
  },
  island: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  islandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  islandName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  islandOwner: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  catsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  catAvatar: {
    alignItems: 'center',
    margin: SPACING.sm,
  },
  catEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  catName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  messageBubbles: {
    position: 'absolute',
    top: 20,
    right: 20,
    maxWidth: width * 0.6,
  },
  messageBubble: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    maxWidth: '100%',
  },
  messageText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  messageTime: {
    ...TYPOGRAPHY.small,
    color: COLORS.surface,
    opacity: 0.8,
  },
  messageInputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#18C07A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledSendButton: {
    backgroundColor: COLORS.disabled,
  },
  sendButtonText: {
    fontSize: 16,
  },
});

export default CommunityScreen;
