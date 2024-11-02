// ThemeSwitcher.js
import React, { useContext } from "react";
import { View, Button, StyleSheet } from "react-native";
import { ThemeContext } from "./ThemeContext";

const ThemeSwitcher = ({ newTheme }) => {
  const { toggleTheme } = useContext(ThemeContext);

  const handleSwitchTheme = () => {
    toggleTheme(newTheme);
  };

  return (
    <View style={styles.container}>
      <Button
        title={`Switch to ${newTheme === "dark" ? "Light" : "Dark"} Mode`}
        onPress={handleSwitchTheme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
});

export default ThemeSwitcher;
