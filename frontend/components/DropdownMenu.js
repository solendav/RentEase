import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const DropdownMenu = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleMenu = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={toggleMenu} 
        style={styles.iconContainer} // Container for the icon with increased touchable area
      >
        <MaterialIcons name="more-vert" size={24} color="black" />
      </TouchableOpacity>
      {isVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text>Account No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text>Change Password</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  iconContainer: {
    padding: 20, // Increased padding for touchable area
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 40, // Adjusted to be below the icon
    backgroundColor: 'white',
    borderRadius: 4,
    elevation: 4, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10,
    width: 150, // Adjust width as needed
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
});

export default DropdownMenu;
