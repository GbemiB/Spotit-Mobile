import SplashScreen from '../../modules/onboarding/SplashScreen.jsx';
import WelcomeScreen from '../../modules/onboarding/WelcomeScreen.jsx';
import LoginScreen from '../../modules/onboarding/LoginScreen.jsx';
import SignupScreen from '../../modules/onboarding/SignupScreen.jsx';
import TermsScreen from '../../modules/onboarding/TermsScreen.jsx';
import ForgotPasswordScreen from '../../modules/onboarding/ForgotPasswordScreen.jsx';
import OtpVerifyScreen from '../../modules/onboarding/OtpVerifyScreen.jsx';
import OnboardingScreen from '../../modules/onboarding/OnboardingScreen.jsx';
import HomeScreen from '../../modules/dashboard/HomeScreen.jsx';
import CalendarScreen from '../../modules/calender/CalendarScreen.jsx';
import InsightsScreen from '../../modules/insights/InsightsScreen.jsx';
import RewardsScreen from '../../modules/rewards/RewardsScreen.jsx';
import SettingsScreen from '../../modules/onboarding/SettingsScreen.jsx';

// Pre-auth flow, keyed by state.authScreen
export const AUTH_SCREENS = {
  splash: SplashScreen,
  welcome: WelcomeScreen,
  login: LoginScreen,
  signup: SignupScreen,
  terms: TermsScreen,
  'forgot-password': ForgotPasswordScreen,
  'otp-verify': OtpVerifyScreen,
};

// First-run setup, shown once authenticated but before state.onboarded
export { OnboardingScreen };

// Main app tabs, keyed by state.screen
export const TAB_SCREENS = {
  home: HomeScreen,
  cal: CalendarScreen,
  insights: InsightsScreen,
  rewards: RewardsScreen,
  settings: SettingsScreen,
};

export const DEFAULT_TAB_SCREEN = HomeScreen;
