import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Collapsible from "react-native-collapsible";
import withAuth from './../../components/withAuth';
import { ThemeContext } from './../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useNavigation } from "@react-navigation/native";
import '../i18n'; // Ensure this is imported to initialize i18next
const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState({
    personalProfile: true,
    privacySecurity: true,
    language: true,
    notifications: true,
    theme: true,
    changerole: true,
  });
  const [currentRole, setCurrentRole] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleThemeChange = (theme) => {
    toggleTheme(theme);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync("user_id");
        if (storedUserId) {
          const response = await axios.get(`https://renteasebackend-orna.onrender.com/users/${storedUserId}`);
          if (response.data) {
            const roleFromApi = response.data.role;
            setCurrentRole(roleFromApi);
          } else {
            console.error("User profile not found.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error.response ? error.response.data : error.message);
      }
    };
  
    fetchUserRole();
  }, []);
  
  const showComingSoonAlert = () => {
    Alert.alert(
      "Coming Soon", // Title
      "This feature will be available soon!", // Message
      [
        {
          text: "OK",
          onPress: () => console.log("OK Pressed"),
        }
      ],
      { cancelable: true }
    );
  };

  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChangeRole = (newRole) => {
    if (newRole === currentRole) return;
    setSelectedRole(newRole);
    setRoleModalVisible(true);
  };

  const confirmRoleChange = async () => {
    try {
      // Update the role in the database
      const userId = await SecureStore.getItemAsync("user_id");
      if (!userId || userId.length !== 24) {
        console.error("Invalid user ID");
        Alert.alert(t('Error'), t('Invalid user ID.'));
        return;
      }
      
      if (![1, 2, 3].includes(selectedRole)) {
        console.error("Invalid role value");
        Alert.alert(t('Error'), t('Invalid role.'));
        return;
      }
      const response = await axios.put(
        `  https://renteasebackend-orna.onrender.com/api/profile/updateRole/${userId}`,
        { role: selectedRole }
      );

      if (response.data.success) {
        // Update SecureStore with the new role
        await SecureStore.setItemAsync("role", selectedRole.toString());

        // Update the local state and close the modal
        setCurrentRole(selectedRole);
        setRoleModalVisible(false);

        Alert.alert(t('Success'), ('Role updated successfully'));
      } else {
        Alert.alert(t('Error'), response.data.message || t('Failed to update role.'));
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      Alert.alert(t('Error'), t('Failed to update role.'));
    }
  };

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
    SecureStore.setItemAsync("user_language", language); // Store the language preference
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#212121' : '#f5f5f5',
      paddingTop: 20,
    },
    scrollViewContent: {
      paddingVertical: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff',
      marginVertical: 5,
      marginHorizontal: 10,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 2,
    },
    headerText: {
      flex: 1,
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff',
      marginVertical: 5,
      marginHorizontal: 10,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 2,
      marginLeft: 25,
    },
    settingIte: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff',
      marginVertical: 5,
      marginHorizontal: 10,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 2,
      marginLeft: 40,
    },
    icon: {
      marginRight: 15,
      color: theme === 'dark' ? '#fff' : '#00796b',
    },
    label: {
      flex: 1,
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    currentRole: {
      fontSize: 14,
      color: theme === 'dark' ? '#ddd' : '#555',
      marginLeft: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      width: "80%",
      padding: 20,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff',
      borderRadius: 10,
      alignItems: "center",
    },
    modalText: {
      fontSize: 16,
      marginBottom: 20,
      color: theme === 'dark' ? '#fff' : '#333',
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <TouchableOpacity style={styles.header} onPress={() => toggleCollapse("personalProfile")}>
          <Text style={styles.headerText}>{t('Personal Profile')}</Text>
          <Icon name={collapsed.personalProfile ? "expand-more" : "expand-less"} size={24} color="#00796b" />
        </TouchableOpacity>
        <Collapsible collapsed={collapsed.personalProfile}>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("EditProfile")}>
            <Icon name="edit" size={24} color="#00796b" style={styles.icon} />
            <Text style={styles.label}>{t('Edit Personal Profile')}</Text>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => toggleCollapse("changerole")}>
            <Icon name="swap-horiz" size={24} color="#00796b" style={styles.icon} />
            <Text style={styles.label}>{t('Change Role')}</Text>
            <Text style={styles.currentRole}></Text>
            <Icon name={collapsed.changerole ? "expand-more" : "expand-less"} size={24} color="#00796b" />
          </TouchableOpacity>
          <Collapsible collapsed={collapsed.changerole}>
            <TouchableOpacity style={styles.settingIte} onPress={() => handleChangeRole(1)}>
              <Icon name="edit" size={24} color="#00796b" style={styles.icon} />
              <Text style={styles.label}>{t('Change to Tenant')}</Text>
              {currentRole === 1 && <Icon name="check-circle" size={24} color="#4caf50" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingIte} onPress={() => handleChangeRole(2)}>
              <Icon name="edit" size={24} color="#00796b" style={styles.icon} />
              <Text style={styles.label}>{t('Change to Owner')}</Text>
              {currentRole === 2 && <Icon name="check-circle" size={24} color="#4caf50" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingIte} onPress={() => handleChangeRole(3)}>
              <Icon name="edit" size={24} color="#00796b" style={styles.icon} />
              <Text style={styles.label}>{t('Change to Both')}</Text>
              {currentRole === 3 && <Icon name="check-circle" size={24} color="#4caf50" />}
            </TouchableOpacity>
          </Collapsible>
        </Collapsible>

        <TouchableOpacity style={styles.header} onPress={() => toggleCollapse('privacySecurity')}>
          <Text style={styles.headerText}>{t('Privacy and Security')}</Text>
          <Icon name={collapsed.privacySecurity ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={24} color={theme === 'dark' ? '#fff' : '#00796b'} />
        </TouchableOpacity>
        <Collapsible collapsed={collapsed.privacySecurity}>
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("ChangePassword")}>
            <Icon name="lock" size={24} style={styles.icon} />
            <Text style={styles.label}>{t('Change Password')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => showComingSoonAlert()}>
            <Icon name="security" size={24} style={styles.icon} />
            <Text style={styles.label}>{t('Two-Factor Verification')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => showComingSoonAlert()}>
            <Icon name="settings" size={24} style={styles.icon} />
            <Text style={styles.label}>{t('Session Settings')}</Text>
          </TouchableOpacity>
        </Collapsible>

        <TouchableOpacity style={styles.header} onPress={() => toggleCollapse('language')}>
          <Text style={styles.headerText}>{t('Language')}</Text>
          <Icon name={collapsed.language ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={24} color={theme === 'dark' ? '#fff' : '#00796b'} />
        </TouchableOpacity>
        <Collapsible collapsed={collapsed.language}>
          <TouchableOpacity style={styles.settingItem} onPress={() => handleLanguageChange('am')}>
            <Text style={styles.label}>{t('Amharic')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => handleLanguageChange('en')}>
            <Text style={styles.label}>{t('English')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => handleLanguageChange('fr')}>
            <Text style={styles.label}>{t('French')}</Text>
          </TouchableOpacity>
        </Collapsible>

        <TouchableOpacity style={styles.header} onPress={() => toggleCollapse('notifications')}>
          <Text style={styles.headerText}>{t('Notifications')}</Text>
          <Icon name={collapsed.notifications ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={24} color={theme === 'dark' ? '#fff' : '#00796b'} />
        </TouchableOpacity>
        <Collapsible collapsed={collapsed.notifications}>
          <TouchableOpacity style={styles.settingItem} onPress={() => showComingSoonAlert()}>
            <Icon name="notifications" size={24} style={styles.icon} />
            <Text style={styles.label}>{t('Notification Settings')}</Text>
          </TouchableOpacity>
        </Collapsible>

        <TouchableOpacity style={styles.header} onPress={() => toggleCollapse('theme')}>
          <Text style={styles.headerText}>{t('Theme')}</Text>
          <Icon name={collapsed.theme ? "keyboard-arrow-down" : "keyboard-arrow-up"} size={24} color={theme === 'dark' ? '#fff' : '#00796b'} />
        </TouchableOpacity>
        <Collapsible collapsed={collapsed.theme}>
          <TouchableOpacity style={styles.settingItem} onPress={() => handleThemeChange('light')}>
            <Icon name="wb-sunny" size={24} style={styles.icon} />
            <Text style={styles.label}>{t('Light Theme')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => handleThemeChange('dark')}>
            <Icon name="nights-stay" size={24} style={styles.icon} />
            <Text style={styles.label}>{t('Dark Theme')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={() => handleThemeChange('system')}>
            <Icon name="brightness-3" size={24} color="#00796b" style={styles.icon} />
            <Text style={styles.label}>{t('System Theme')}</Text>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </Collapsible>
      </ScrollView>

      <Modal
        transparent={true}
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {t('Are you sure you want to change your role to')} {selectedRole}?
            </Text>
          <View style={styles.modalButtons}>
  <TouchableOpacity onPress={confirmRoleChange} style={styles.button}>
    <Text style={styles.buttonText}>{t('Confirm')}</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setRoleModalVisible(false)} style={styles.button}>
    <Text style={styles.buttonText}>{t('Cancel')}</Text>
  </TouchableOpacity>
</View>

          </View>
        </View>
      </Modal>
    </View>
  );
};

export default withAuth(SettingsScreen);
