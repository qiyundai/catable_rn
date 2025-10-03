import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store';
import { LoginForm, RegisterForm } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SOCIAL_LOGIN_PROVIDERS } from '../constants';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { setUser, setAuthenticated } = useAppStore();

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Mock authentication - in real app, this would call an API
    const mockUser = {
      id: '1',
      email: loginForm.email,
      displayName: 'Cat Owner',
      region: 'US',
      language: 'en' as const,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(mockUser);
    setAuthenticated(true);
  };

  const handleRegister = async () => {
    if (!registerForm.displayName || !registerForm.email || !registerForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Mock registration
    const mockUser = {
      id: '1',
      email: registerForm.email,
      displayName: registerForm.displayName,
      region: 'US',
      language: 'en' as const,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(mockUser);
    setAuthenticated(true);
  };

  const handleSocialLogin = (provider: string) => {
    // Mock social login
    const mockUser = {
      id: '1',
      email: `user@${provider}.com`,
      displayName: `${provider} User`,
      region: 'US',
      language: 'en' as const,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(mockUser);
    setAuthenticated(true);
  };

  const handleGuestMode = () => {
    const guestUser = {
      id: 'guest',
      email: '',
      displayName: 'Guest User',
      region: 'US',
      language: 'en' as const,
      isGuest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(guestUser);
    setAuthenticated(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>CAT-able</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {isLogin ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={loginForm.email}
                onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={loginForm.password}
                onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                secureTextEntry
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                value={registerForm.displayName}
                onChangeText={(text) => setRegisterForm({ ...registerForm, displayName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={registerForm.email}
                onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={registerForm.password}
                onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={registerForm.confirmPassword}
                onChangeText={(text) => setRegisterForm({ ...registerForm, confirmPassword: text })}
                secureTextEntry
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            {SOCIAL_LOGIN_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[styles.socialButton, { backgroundColor: provider.color }]}
                onPress={() => handleSocialLogin(provider.id)}
              >
                <Text style={styles.socialButtonIcon}>{provider.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchButtonText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.lg,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  socialButtonIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  guestButton: {
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  guestButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  switchButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  switchButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default AuthScreen;
