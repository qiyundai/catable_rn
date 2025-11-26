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
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { LoginForm, RegisterForm } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, SOCIAL_LOGIN_PROVIDERS, SHADOWS } from '../constants';
import { Logo } from '../components/Logo';

const AuthScreen: React.FC = () => {
  const { t } = useTranslation();
  const [showInitialView, setShowInitialView] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { setUser, setAuthenticated } = useAppStore();

  const handleInitialLogin = () => {
    setIsLogin(true);
    setShowInitialView(false);
  };

  const handleInitialRegister = () => {
    setIsLogin(false);
    setShowInitialView(false);
  };

  const handleBackToInitial = () => {
    setShowInitialView(true);
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    // Mock authentication - in real app, this would call an API
    const mockUser = {
      id: '1',
      email: loginForm.email,
      userName: 'Cat Owner',
      region: '',
      language: 'en' as const,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(mockUser);
    setAuthenticated(true);
  };

  const handleRegister = async () => {
    if (!registerForm.userName || !registerForm.email || !registerForm.password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }

    // Mock registration
    const mockUser = {
      id: '1',
      email: registerForm.email,
      userName: registerForm.userName,
      region: '',
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
      userName: `${provider} User`,
      region: '',
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
      userName: 'Guest User',
      region: '',
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
          {showInitialView ? (
            <View style={styles.initialView}>
              <View style={styles.header}>
                <Logo />
              </View>
              
              <View style={styles.initialButtonsContainer}>
                <TouchableOpacity style={styles.loginButton} onPress={handleInitialLogin}>
                  <Text style={styles.loginButtonText}>{t('auth.signIn')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.registerButton} onPress={handleInitialRegister}>
                  <Text style={styles.registerButtonText}>{t('auth.signUp')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.guestLink} onPress={handleGuestMode}>
                  <Text style={styles.guestLinkText}>{t('auth.continueAsGuest')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.subtitle}>
                  {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.backButtonTop}
                onPress={handleBackToInitial}
              >
                <Text style={styles.backButtonIcon}>‹</Text>
              </TouchableOpacity>

              <View style={styles.formContainer}>
                {isLogin ? (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.email')}
                      value={loginForm.email}
                      onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.password')}
                      value={loginForm.password}
                      onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                      secureTextEntry
                    />
                    <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                      <Text style={styles.primaryButtonText}>{t('auth.signIn')}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.userName')}
                      value={registerForm.userName}
                      onChangeText={(text) => setRegisterForm({ ...registerForm, userName: text })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.email')}
                      value={registerForm.email}
                      onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.password')}
                      value={registerForm.password}
                      onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                      secureTextEntry
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.confirmPassword')}
                      value={registerForm.confirmPassword}
                      onChangeText={(text) => setRegisterForm({ ...registerForm, confirmPassword: text })}
                      secureTextEntry
                    />
                    <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                      <Text style={styles.primaryButtonText}>{t('auth.signUp')}</Text>
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{isLogin ? t('auth.orLoginWith') : t('auth.orSignUpWith')}</Text>
                  <View style={styles.dividerLine} />
                </View>

          <View style={styles.socialButtonsContainer}>
            {SOCIAL_LOGIN_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[styles.socialButton, { borderColor: provider.color }]}
                onPress={() => handleSocialLogin(provider.id)}
              >
                <Text style={[styles.socialButtonIcon, { color: provider.color }]}>{provider.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

                <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
                  <Text style={styles.guestButtonText}>{t('auth.continueAsGuest')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => setIsLogin(!isLogin)}
                >
                  <Text style={styles.switchButtonText}>
                    {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
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
    backgroundColor: COLORS.darkInk,
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
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  socialButtonIcon: {
    fontSize: 24,
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
  initialView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  loginButton: {
    backgroundColor: COLORS.darkInk,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
    maxWidth: 300,
  },
  loginButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.darkInk,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
    maxWidth: 300,
  },
  registerButtonText: {
    color: COLORS.darkInk,
    fontSize: 16,
    fontWeight: '600',
  },
  guestLink: {
    padding: SPACING.sm,
  },
  guestLinkText: {
    color: COLORS.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backButtonTop: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButtonIcon: {
    fontSize: 24,
    color: COLORS.darkInk,
    fontWeight: 'bold',
  },
});

export default AuthScreen;