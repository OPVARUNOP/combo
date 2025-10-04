import React, { createContext, useState, useContext } from 'react';
import { themes } from '../styles/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.dark_blue);

  const changeTheme = (themeName) => {
    setTheme(themes[themeName] || themes.dark_blue);
  };

  return <ThemeContext.Provider value={{ theme, changeTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
