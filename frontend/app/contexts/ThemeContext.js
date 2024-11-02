import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await SecureStore.getItemAsync('themes');
        if (storedTheme && storedTheme !== 'system') {
          setTheme(storedTheme);
        } else {
          setTheme(Appearance.getColorScheme());
        }
      } catch (error) {
        console.error("Failed to load theme from SecureStore", error);
      }
    };

    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system') {
        setTheme(colorScheme);
      }
    });

    return () => subscription.remove();
  }, [theme]);

  const toggleTheme = async (newTheme) => {
    try {
      if (newTheme === 'system') {
        setTheme(Appearance.getColorScheme());
      } else {
        setTheme(newTheme);
      }
      await SecureStore.setItemAsync('themes', newTheme);
    } catch (error) {
      console.error("Failed to save theme to SecureStore", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
