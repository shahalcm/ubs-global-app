import AsyncStorage from '@react-native-async-storage/async-storage';

export const colors = {
  primary: '#1a237e',
  accent: '#29b6f6',
  background: '#ffffff',
  surface: '#f5f5f5',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  text: '#1a1a1a',
  textMuted: '#757575',
  border: '#e0e0e0',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const updateGlobalColors = (isDark) => {
  colors.background = isDark ? '#121212' : '#ffffff';
  colors.surface = isDark ? '#1e1e1e' : '#f5f5f5';
  colors.text = isDark ? '#ffffff' : '#1a1a1a';
  colors.textMuted = isDark ? '#aaaaaa' : '#757575';
  colors.border = isDark ? '#2d2d2d' : '#e0e0e0';
  colors.shadow = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';
};

// Initial sync on module load
try {
  AsyncStorage.getItem('dark_theme_enabled').then((val) => {
    if (val === 'true') {
      updateGlobalColors(true);
    }
  });
} catch (e) {
  console.log('Error loading initial colors theme preference:', e);
}

export default colors;
