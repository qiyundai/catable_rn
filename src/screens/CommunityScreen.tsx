import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const { width, height } = Dimensions.get('window');

const CommunityScreen: React.FC = () => {
  const { currentPet, pets } = useAppStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello from my floating island! 🐱', timestamp: '2m ago' },
    { id: '2', text: 'My cat is so playful today! 🎾', timestamp: '5m ago' },
  ]);
  const [currentIsland, setCurrentIsland] = useState(0);

  const islands = [
    { id: 0, name: 'My Island', owner: 'You', cats: pets },
    { id: 1, name: 'Luna\'s Island', owner: 'Sarah', cats: [{ name: 'Luna', avatar: '🐱' }] },
    { id: 2, name: 'Whiskers\' Island', owner: 'Mike', cats: [{ name: 'Whiskers', avatar: '😸' }] },
    { id: 3, name: 'Shadow\'s Island', owner: 'Emma', cats: [{ name: 'Shadow', avatar: '🐈' }] },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        timestamp: 'now',
      };
      setMessages([newMessage, ...messages]);
      setMessage('');
    }
  };

  const renderFloatingIsland = (island: any) => {
    const isCurrentIsland = island.id === currentIsland;
    
    return (
      <View key={island.id} style={[
        styles.island,
        isCurrentIsland && styles.currentIsland
      ]}>
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

        {/* Message bubbles for current island */}
        {isCurrentIsland && (
          <View style={styles.messageBubbles}>
            {messages.slice(0, 3).map((msg) => (
              <View key={msg.id} style={styles.messageBubble}>
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>{msg.timestamp}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Floating Islands */}
      <ScrollView 
        style={styles.islandsContainer}
        contentContainerStyle={styles.islandsContent}
        showsVerticalScrollIndicator={false}
      >
        {islands.map(renderFloatingIsland)}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <View style={styles.messageInput}>
          <TextInput
            style={styles.textInput}
            placeholder="Share something about your cat..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={200}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.disabledSendButton]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Text style={styles.sendButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  islandsContent: {
    padding: SPACING.lg,
  },
  island: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: 200,
  },
  currentIsland: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  disabledSendButton: {
    backgroundColor: COLORS.disabled,
  },
  sendButtonText: {
    fontSize: 16,
  },
});

export default CommunityScreen;
