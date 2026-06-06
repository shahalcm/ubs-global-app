import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateGlobalColors, colors } from '../constants/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkTheme, setDarkThemeState] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedDarkTheme = await AsyncStorage.getItem('dark_theme_enabled');
        if (savedDarkTheme !== null) {
          const isDark = savedDarkTheme === 'true';
          setDarkThemeState(isDark);
          updateGlobalColors(isDark);
        }
      } catch (err) {
        console.log('Failed to load theme preference:', err);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async (val) => {
    setDarkThemeState(val);
    updateGlobalColors(val);
    try {
      await AsyncStorage.setItem('dark_theme_enabled', String(val));
    } catch (err) {
      console.log('Failed to save theme preference:', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkTheme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
