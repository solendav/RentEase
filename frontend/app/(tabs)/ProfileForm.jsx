import React, { useState, useEffect,useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from './../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
const ProfileForm = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [userId, setUserId] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const { theme } = useContext(ThemeContext);
  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handlePhotoOptions = async (option) => {
    if (option === 'gallery') {
      await handleChoosePhoto();
    } else if (option === 'camera') {
      await handleTakePhoto();
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await SecureStore.getItemAsync('user_id');
      if (id) {
        setUserId(id);
      } else {
        Alert.alert('Error', 'User ID is missing.');
      }
    };
    fetchUserId();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'You need to grant access to the media library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      if (type === 'profile') {
        setProfilePicture(result.assets[0].uri);
      } else if (type === 'id') {
        setIdImage(result.assets[0].uri);
      }
    }
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is missing.');
      return;
    }

    if (!firstName || !middleName || !lastName || !phoneNumber || !address || !birthDate) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('first_name', firstName);
    formData.append('middle_name', middleName);
    formData.append('last_name', lastName);
    formData.append('phoneNumber', phoneNumber);
    formData.append('address', address);
    formData.append('birth_date', birthDate.toISOString());

    if (profilePicture) {
      formData.append('profile_picture', {
        uri: profilePicture,
        name: profilePicture.split('/').pop(),
        type: 'image/jpeg',
      });
    }

    if (idImage) {
      formData.append('id_image', {
        uri: idImage,
        name: idImage.split('/').pop(),
        type: 'image/jpeg',
      });
    }

    try {
      const response = await axios.post('https://renteasebackend-orna.onrender.com/api/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'Profile saved successfully.');
      // Clear form after successful submission
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setPhoneNumber('');
      setAddress('');
      setBirthDate(new Date());
      setProfilePicture(null);
      setIdImage(null);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving the profile.');
      console.error('Error saving profile:', error);
    }
  };
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: theme === 'dark' ? Colors.BLACK : "",
    },
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color:  theme === 'dark' ? Colors.PRIMARY : Colors.PRIMARY,
    },
    ilabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.GRAY,
    },
    input: {
      height: 40,
      borderColor:  theme === 'dark' ? Colors.GRAY : Colors.GRAY,
      borderBottomWidth: 1,
      
      paddingHorizontal: 10,
    },
    datePicker: {
      padding: 10,
      borderColor: Colors.GRAY,
      borderBottomWidth: 1,
      
     
      justifyContent: 'center',
      alignItems: 'center',
    },
    datePickerText: {
      fontSize: 16,
      color:  theme === 'dark' ? Colors.WHITE : Colors.BLACK,
    },
    dateText: {
      fontSize: 16,
      marginTop: 10,
      color:  theme === 'dark' ? Colors.WHITE : Colors.BLACK,
    },
    imagePickerContainer: {
      marginBottom: 15,
    },
    imagePicker: {
      padding: 10,
      borderColor: Colors.GRAY,
      borderBottomWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      
      
    },
    image: {
      width: 150,
      height: 100,
      borderRadius: 5,
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    drawerHeader: {
      alignItems: 'center',
      padding: 16,
    },
    profileContainer: {
      position: 'relative',
      width: 80,
      height: 80,
      marginBottom: 10,
      
    },
    profilePictureContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    profilePicture: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignSelf: 'center',
      backgroundColor: '#eee',
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 50,
      padding: 4,
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.drawerHeader}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            
          >
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={[styles.profilePicture, styles.iconContainer]}>
                <Ionicons name="person" size={50} color="#bbb" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraIcon}
            
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          placeholder="Enter First Name"
          placeholderTextColor={Colors.GRAY}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Middle Name</Text>
        <TextInput
          style={styles.input}
          value={middleName}
          onChangeText={(text) => setMiddleName(text)}
          placeholder="Enter Middle Name"
          placeholderTextColor={Colors.GRAY}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          placeholder="Enter Last Name"
          placeholderTextColor={Colors.GRAY}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          placeholderTextColor={Colors.GRAY}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={(text) => setAddress(text)}
          placeholder="Enter Address"
          placeholderTextColor={Colors.GRAY}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{birthDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
       
      </View>

      <View style={styles.imagePickerContainer}>
        <Text style={styles.label}>Profile Picture</Text>
        <Pressable onPress={() => pickImage('profile')} style={styles.imagePicker}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.image} />
          ) : (
            <Text  style={styles.ilabel} >Select Profile Picture</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.imagePickerContainer}>
        <Text style={styles.label}>ID Image</Text>
        <Pressable onPress={() => pickImage('id')} style={styles.imagePicker}>
          {idImage ? (
            <Image source={{ uri: idImage }} style={styles.image} />
          ) : (
            <Text style={styles.ilabel}>Select ID Image</Text>
          )}
        </Pressable>
      </View>

      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};



export default ProfileForm;
