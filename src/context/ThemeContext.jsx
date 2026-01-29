import { createContext, useContext, useEffect, useState } from 'react';
import API from '../utils/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accent') || '#3b82f6');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply Accent Color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    // Simple logic to darken the hover color slightly
    // For a real prod app, we might use a library, but let's just use the same or predefined maps.
    // Actually, let's just use the hex directly. Using a map is safer for distinct hover states.
    const colorMap = {
      '#3b82f6': '#2563eb', // Blue -> Dark Blue
      '#10b981': '#059669', // Emerald
      '#8b5cf6': '#7c3aed', // Violet
      '#f59e0b': '#d97706', // Amber
      '#f43f5e': '#e11d48', // Rose
    };
    document.documentElement.style.setProperty(
      '--accent-hover',
      colorMap[accentColor] || accentColor
    );
    document.documentElement.style.setProperty('--nav-text-active', accentColor);

    localStorage.setItem('accent', accentColor);
  }, [accentColor]);

  const syncThemeWithBackend = async (newTheme) => {
    try {
      await API.post('/settings', { theme: newTheme });
    } catch (err) {
      console.error('Failed to sync theme with backend:', err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    syncThemeWithBackend(newTheme);
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    syncThemeWithBackend(newTheme);
  };

  const updateAccent = (newColor) => {
    setAccentColor(newColor);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, updateTheme, accentColor, updateAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
