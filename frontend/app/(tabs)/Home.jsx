import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { Colors } from '../../constants/Colors';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import debounce from 'lodash.debounce';
import { FontAwesome } from "@expo/vector-icons";
import * as Location from 'expo-location';
import PropertyPage from './../../components/PropertyPage'
import { ThemeContext } from './../contexts/ThemeContext'; 
import * as SecureStore from "expo-secure-store";
import { useTranslation } from 'react-i18next';
import RecommendationsSection from "./../../components/RecommendationsSection"
const Home = () => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPressed, setFilterPressed] = useState(false);
  const [role, setRole] = useState(null);
  const [frequentlyRentedProperties, setFrequentlyRentedProperties] = useState([]);
  const [fontsLoaded] = useFonts({
    outfit: require("./../../assets/fonts/Outfit-Regular.ttf"),
    "outfit-medium": require("./../../assets/fonts/Outfit-Medium.ttf"),
    "outfit-bold": require("./../../assets/fonts/Outfit-Bold.ttf"),
  });
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  
  const [errorMsg, setErrorMsg] = useState(null);
  const headerHeight = useHeaderHeight();
  const scrollViewRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("All"); 

  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext); 

  // Function to fetch properties with a search query
  const fetchProperties = async (query = "") => {
    setLoading(true); // Set loading to true before starting the fetch
  
    try {
      // Fetch properties with the search query
      const response = await axios.get(`https://renteasebackend-orna.onrender.com/properties?search=${query}`);
  
      // Sort properties by average rating in descending order
      const sortedProperties = response.data.sort((a, b) => b.average_rating - a.average_rating);
  
      // Update state with the sorted properties
      setProperties(sortedProperties);
      setFilteredProperties(sortedProperties);
  
    } catch (error) {
      // Handle error appropriately
      console.error("Error fetching properties:", error);
      // You might want to set an error state here to inform the user
    } finally {
      // Always set loading to false once the fetch is done, regardless of success or failure
      setLoading(false);
    }
  };
  const fetchFrequentlyRentedProperties = async () => {
    try {
      const response = await axios.get("https://renteasebackend-orna.onrender.com/api/frequently-rented");
      setFrequentlyRentedProperties(response.data);
    } catch (error) {
      
    }
  };

  // Use effect to fetch properties initially
  useEffect(() => {
    fetchProperties();
    fetchFrequentlyRentedProperties();
  }, []);
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = await SecureStore.getItemAsync('role');
        if (storedRole) {
          setRole(parseInt(storedRole, 10)); // Convert stored role to an integer
        } else {
          setRole(null); // No role found, meaning the user is not signed in
        }
      } catch (error) {
     // Log the specific error message
        setRole(null); // Handle the error by treating it as no role found
      }
    };
  
    fetchRole();
  }, []);
  

  useEffect(() => {
    const getLocationAndAddress = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let { coords } = await Location.getCurrentPositionAsync({});
        setLocation(coords);

        const [addressData] = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        setAddress(addressData);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    getLocationAndAddress();
  }, []);
  // Use effect to filter properties based on category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProperties(properties);
    } else {
      setFilteredProperties(properties.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, properties]);

  // Handle search input change
  const handleSearch = debounce(async (searchQuery) => {
    await fetchProperties(searchQuery);
  }, 500);

  const handleRefresh = async () => {
    await fetchProperties(input);
  };

  const toggleFilter = () => {
    setFilterPressed(!filterPressed);
    navigation.navigate('Explore', { filterPressed: !filterPressed });
  };

  const onCatChanged = (category) => {
    setSelectedCategory(category);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'All':
        return 'list';
      case 'House':
        return 'home';
      case 'Vehicle':
        return 'car-sport';
      case 'Event_Equipment':
        return 'book';
      case 'Electronics':
        return 'tablet-portrait';
      case 'Other':
        return 'ellipsis-horizontal';
      case 'Cloth':
        return 'shirt';
     
      default:
        return 'help-circle';
    }
  };

  // Dynamically apply theme to ALL styles
  const getThemedStyles = (theme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#212121' : '#fff', 
    },
    header: {
      backgroundColor: theme === 'dark' ? Colors.DARK_BACKGROUND : Colors.BACKGROUND, 
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    locationText: {
      fontSize: 12,
      color: theme === 'dark' ? "#D3D3D3" : Colors.GRAY, 
    },
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {
      marginRight: 4,
      color: theme === 'dark' ? Colors.PRIMARY : Colors.PRIMARY, 
    },
    location: {
      fontSize: 16,
      fontFamily: 'outfit-medium',
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    search: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#303030' : '#f0f0f0', 
      borderRadius: 10,
      padding: 8,
    },
    searchIcon: {
      marginRight: 8,
      color: theme === 'dark' ? "#D3D3D3" : Colors.PRIMARY, 
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'outfit',
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    filterButton: {
      marginLeft: 10,
      backgroundColor: theme === 'dark' ? '#303030' : '#f0f0f0', 
      borderRadius: 10,
    },
    categoryTitle: {
      fontSize: 18,
      fontFamily: 'outfit-medium',
      paddingHorizontal: 16,
      marginVertical: 10,
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    categoryScrollView: {
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    categoryButton: {
      backgroundColor: theme === 'dark' ? '#303030' : '#f0f0f0', 
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryButtonSelected: {
      backgroundColor: Colors.PRIMARY,
    },
    categoryIcon: {
      marginRight: 8,
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    categoryText: {
      fontSize: 14,
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
      fontFamily: 'outfit',
    },
    categoryTextSelected: {
      color: '#fff',
    },
    recommendation: {
      padding: 10,
      backgroundColor: theme === 'dark' ? Colors.BLACK : '#fff', 
    },
    recommendationTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    recommendationSubtitle: {
      fontSize: 16,
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
      marginVertical: 5,
    },
    itemScrollView: {
      marginTop: 10,
    },
    itemContainer: {
      margin: 15,
      backgroundColor: theme === 'dark' ? '#303030' : '#fff', 
      borderRadius: 10,
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, 
      shadowRadius: 5, 
      elevation: 8, 
      padding: 10, 
    },
    image: {
      width: 200,
      height: 150,
      borderRadius: 10,
      
    },
    itemTextContainer: {
      marginTop: 5,
    },
    description: {
      fontSize: 14,
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    promotionContainer: {
      backgroundColor: theme === 'dark' ? '#303030' : '#f9f9f9', 
      borderRadius: 15, 
      padding: 20, 
      marginVertical: 20, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 10, 
      elevation: 5, 
      flexDirection: 'row', 
      alignItems: 'center', 
    },
    promotionContent: {
      flex: 1, 
      paddingRight: 10, 
    },
    promotionText: {
      marginBottom: 10, 
    },
    promotionTitle: {
      fontSize: 20, 
      fontWeight: 'bold', 
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    promotionSubtitle: {
      fontSize: 16, 
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
    },
    registerButton: {
      backgroundColor: Colors.PRIMARY, 
      paddingVertical: 10, 
      paddingHorizontal: 20, 
      borderRadius: 10, 
      alignItems: 'center', 
      marginTop: 10, 
    },
    registerButtonText: {
      color: '#fff', 
      fontSize: 16, 
      fontWeight: '600', 
    },
    promotionImage: {
      width: 100,
      height: 100,
      borderRadius: 10,
      marginLeft: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      color: 'red',
      textAlign: 'center',
    },
    scrollContent: {
      paddingBottom: 20,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 3,
    },
    ratingText: {
      fontSize: 14,
      color: "#FFD700", 
      marginLeft: 5,
      fontWeight: "bold",
    },
    countText: {
      fontSize: 12,
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
      marginTop: 3,
    },
  });

  const styles = getThemedStyles(theme); 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[Colors.PRIMARY]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.locationText}>{t('Your Current Location')}</Text>
          <View style={styles.locationInfo}>
            <Ionicons 
              name="location-sharp" 
              size={24} 
              color={Colors.PRIMARY} 
              style={styles.locationIcon} 
            />
            {address && (
              <Text style={styles.location}>
                {address.city} {address.country}
              </Text>
            )}
          </View>
          <View style={styles.searchWrapper}>
            <View style={styles.search}>
              <Ionicons name="search" size={24} color={Colors.PRIMARY} style={styles.searchIcon} />
              <TextInput
                value={input}
                onChangeText={(text) => {
                  setInput(text);
                  handleSearch(text);
                }}
                style={styles.searchInput}
                placeholder={t('Search')}
                placeholderTextColor={theme === 'dark' ? '#ccc' : '#333' }
                onFocus={() => navigation.navigate('Explore')}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterPressed ? styles.filterButtonPressed : null,
              ]}
              onPress={toggleFilter}
            >
              <Ionicons name="options" size={32} style={{ color: theme === 'dark' ? '#fff' : '#333' , padding: 10 }} />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text style={styles.categoryTitle}>{t('Categories')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
            {[t('All'), t('House'), t('Vehicle'), t('Event_Equipment'), t('Electronics'),  t('Cloth'),  t('Other')].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categoryButtonSelected,
                ]}
                onPress={() => onCatChanged(cat)}
              >
                {/* Use conditional rendering to display the correct icon */}
                {selectedCategory === cat ? ( 
                  <View style={styles.categoryIcon}>
                  
                      <Ionicons
                        name={
                          cat === t('All') ? 'list' :
                          cat === t('House') ? 'home' :
                          cat ===  t('Vehicle') ? 'car-sport' :
                          cat === t('Event_Equipment') ? 'book' :
                          cat === t('Electronics')? 'tablet-portrait' :
                          cat === t('Cloth')? 'shirt' :
                          cat === t('Other') ? 'ellipsis-horizontal' :
                         
                          'help-circle' // Default icon
                        }
                        size={24}
                        color={theme === 'dark' ? '#fff' : '#fff' }// White color
                      />
                   
                  </View>
                ) : (
                  <View style={styles.categoryIcon}>
                   
                      <Ionicons
                        name={
                          cat === t('All') ? 'list' :
                          cat === t('House') ? 'home' :
                          cat === t('Vehicle') ? 'car-sport' :
                          cat === t('Event_Equipment') ? 'book' :
                          cat === t('Cloth')? 'shirt' :
                          cat === t('Electronics') ? 'tablet-portrait' :
                          cat === t('Other') ? 'ellipsis-horizontal' :
                        
                          'help-circle' // Default icon
                        }
                        size={24}
                        color={theme === 'dark' ? '#fff' : '#333' }// Dark gray color
                      />
                  
                  </View>
                )}
                <Text style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextSelected
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> 
        <View style={styles.recommendation}>
        <Text style={styles.recommendationTitle}>{t('Recomended for you')}</Text>
        <RecommendationsSection/>
        </View>
        {/* Recommendations Section */}
        <View style={styles.recommendation}>
          <Text style={styles.recommendationTitle}>{t('Top Rated')}</Text>
          {/* <Text style={styles.recommendationSubtitle}> */}
            {/* {filteredProperties.length}{t('Properties in Addis Ababa')} */}
          {/* </Text> */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemScrollView}>
            {filteredProperties.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.itemContainer}
                onPress={() => navigation.navigate('propertyDetail', { _id: item._id })}
              >
                <Image
                  source={{ uri: item.image && item.image.length > 0 ? `https://renteasebackend-orna.onrender.com/uploads/${item.image[0]}` : 'https://via.placeholder.com/200x200.png?text=No+Image' }}
                  style={styles.image}
                  onError={() => console.log(`Error loading image for item ${item._id}`)}
                />
                <View style={styles.itemTextContainer}>
                  <Text style={styles.description}>{item.property_name}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={16} color="#FFD700" /> 
                  <Text style={styles.ratingText}> {typeof item.average_rating === 'number' ? item.average_rating.toFixed(1) : '0.0'}</Text> 
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.recommendation}>
          <Text style={styles.recommendationTitle}>{t('Frequently Rented Properties')}</Text>
          {/* <Text style={styles.recommendationSubtitle}>
            {frequentlyRentedProperties.filter(item => selectedCategory === "All" || item.propertyDetails.category === selectedCategory).length}{t('Properties')} 
          </Text> */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemScrollView}>
            {frequentlyRentedProperties
              .filter(item => selectedCategory === "All" || item.propertyDetails.category === selectedCategory)
              .map((item) => (
                <TouchableOpacity
                  key={item.propertyDetails._id}
                  style={styles.itemContainer}
                  onPress={() => navigation.navigate('propertyDetail', { _id: item.propertyDetails._id })}
                >
                  <Image
                    source={{
                      uri: item.propertyDetails.image && item.propertyDetails.image.length > 0
                        ? `https://renteasebackend-orna.onrender.com/uploads/${item.propertyDetails.image[0]}`
                        : 'https://via.placeholder.com/200x200.png?text=No+Image'
                    }}
                    style={styles.image}
                    onError={() => console.log(`Error loading image for item ${item.propertyDetails._id}`)}
                  />
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.description}>{item.propertyDetails.name}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <FontAwesome name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}> {typeof item.propertyDetails.average_rating === 'number' ? item.propertyDetails.average_rating.toFixed(1) : '0.0'}</Text> 
                  </View>
                  <Text style={styles.countText}>{t('Booked')} {item.count} {t('times')}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
        <PropertyPage/>
        <View style={styles.promotionContainer}>
  <View style={styles.promotionContent}>
    <View style={styles.promotionText}>
      <Text style={styles.promotionTitle}>
        {role === 1 ? t('Expand your opportunities!') 
          : role === 2 ? t('Maximize your reach!')
          : role === 3 ? t('Add and rent your properties')
          : t('Join our platform!')}
      </Text>
      <Text style={styles.promotionSubtitle}>
        {role === 1 
          ? t('Upgrade to a combined role to maximize your earnings and opportunities.')
          : role === 2 
          ? t('Upgrade to include renting and earn more by utilizing all platform features!')
          : role === 3 
          ? t('You’re all set! Start adding your properties and rent them out now and rent for your self.')
          : t('Sign up to start enjoying our services!')}
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => 
          role === 1 ? router.push('/Settings') 
        : role === 2 ? router.push('/Settings') 
        : role === 3 ? navigation.navigate('(tabs)', { screen: 'Add Property' })
        : router.push('/auth/SignUp')
      }
      style={styles.registerButton}
    >
      <Text style={styles.registerButtonText}>
        {role === 1 ? t('Upgrade to Owner & Tenant') 
          : role === 2 ? t('Upgrade to Full Access' )
          : role === 3 ? t('Add Property')
          : 'Register'}
      </Text>
    </TouchableOpacity>
  </View>
  <Image
    source={require('./../../assets/images/image.png')}
    style={styles.promotionImage}
  />
</View>

        
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;