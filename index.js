import { registerRootComponent } from 'expo';
import { installCrashReporter } from './src/shared/utils/crashReporter.js';
import App from './App';
installCrashReporter();
registerRootComponent(App);
