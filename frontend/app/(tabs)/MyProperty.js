import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import withAuth from "../../components/withAuth";
import withRoleAccess from "../../components/withRoleAccess";
import RotatingDotsLoader from "./../../components/RotatingDotsLoader";
import { ThemeContext } from "./../contexts/ThemeContext";
import { Colors } from "../../constants/Colors";
const MyProperty = () => {
  const [userId, setUserId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [filter, setFilter] = useState("all"); // State for filter
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync("user_id");
        setUserId(id);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      if (userId) {
        try {
          const response = await axios.get(
            `https://renteasebackend-orna.onrender.com/api/properties/userown/${userId}`
          );
          setProperties(response.data);
          filterProperties(response.data, filter);
        } catch (err) {
          console.error("Error fetching properties:", err);
          
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProperties();
  }, [userId, filter]);

  const filterProperties = (properties, filter) => {
    if (filter === "all") {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(
        (prop) => prop.verification === filter
      );
      setFilteredProperties(filtered);
    }
  };

  const handleEdit = (propertyId) => {
    navigation.navigate("EditProperty", { propertyId });
  };

  const handleDelete = async (propertyId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this property?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await axios.delete(
                `https://renteasebackend-orna.onrender.com/api/properties/${propertyId}`
              );
              setProperties(
                properties.filter((prop) => prop._id !== propertyId)
              );
              filterProperties(
                properties.filter((prop) => prop._id !== propertyId),
                filter
              );
              Alert.alert("Success", "Property deleted successfully.");
            } catch (err) {
              
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: theme === "dark" ? Colors.BLACK : "#fff",
    },
    itemContainer: {
      flexDirection: "column",
      padding: 10,
      borderRadius: 12,
      backgroundColor: theme === "dark" ? "#303030" : "#fff",
      marginBottom: 15,
      marginHorizontal: 10,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    imageContainer: {
      width: 120,
      height: 80,
      borderRadius: 10,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    imagePlaceholder: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderColor: theme === "dark" ? Colors.GRAY : "#ddd",
      borderWidth: 1,
      backgroundColor: theme === "dark" ? Colors.DARK_GRAY : "#f0f0f0",
    },
    placeholderText: {
      color: theme === "dark" ? Colors.WHITE : "#888",
      fontSize: 14,
      textAlign: "center",
    },
    textContainer: {
      flex: 1,
      marginLeft: 10,
    },
    propertyName: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme === "dark" ? Colors.PRIMARY : Colors.PRIMARY,
    },
    propertyDetails: {
      fontSize: 14,
      color: theme === "dark" ? Colors.WHITE : "#555555",
    },
    statusContainer: {
      justifyContent: "center",
      alignItems: "flex-end",
      marginLeft: 10,
    },
    available: {
      color: "green",
      fontWeight: "bold",
    },
    rented: {
      color: "red",
      fontWeight: "bold",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    button: {
      backgroundColor: Colors.PRIMARY,
      padding: 10,
      borderRadius: 5,
      flex: 1,
      marginHorizontal: 5,
    },
    deleteButton: {
      backgroundColor: "#DC3545",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      textAlign: "center",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      zIndex: 100,
    },
    noPropertiesTextDark: {
      fontSize: 16,
      color: Colors.WHITE,
    },
    noPropertiesTextLight: {
      fontSize: 16,
      color: "#777777",
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 10,
    },
    filterButton: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: theme === 'dark' ? '#303030' : '#f0f0f0', 
      flex: 1,
      marginHorizontal: 5,
      alignItems: "center",
    },
    filterButtonText: {
      color: theme === 'dark' ? "#D3D3D3" : Colors.BLACK, 
      fontSize: 16,
    },
    activeFilter: {
      backgroundColor: Colors.PRIMARY,
    },
    selectedFilterText:{
      color:"#fff"
    },
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? Colors.BLACK : "#fff" },
      ]}
    >
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => {
            setFilter("all");
            filterProperties(properties, "all");
          }}
        >
          <Text style={[
            styles.filterButtonText,
            filter === "all" && styles.selectedFilterText,
          ]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "verified" && styles.activeFilter,
          ]}
          onPress={() => {
            setFilter("verified");
            filterProperties(properties, "verified");
          }}
        >
          <Text style={[
            styles.filterButtonText,
            filter === "verified" && styles.selectedFilterText,
          ]}>Verified</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "pending" && styles.activeFilter,
          ]}
          onPress={() => {
            setFilter("pending");
            filterProperties(properties, "pending");
          }}
        >
          <Text style={[
            styles.filterButtonText,
            filter === "pending" && styles.selectedFilterText,
          ]}>UnVerified</Text>
        </TouchableOpacity>
      </View>
      {filteredProperties.length > 0 ? (
       
         <FlatList
         data={filteredProperties}
         keyExtractor={(item) => item._id.toString()}
         renderItem={({ item }) => (
           <View style={styles.itemContainer}>
             <View style={styles.contentContainer}>
               <View style={styles.imageContainer}>
                 {item.image.length > 0 ? (
                   <Image
                     style={styles.image}
                     source={{
                       uri: `https://renteasebackend-orna.onrender.com/uploads/${item.image[0]}`,
                     }}
                     onError={() => console.log("Error loading image")}
                   />
                 ) : (
                   <View style={styles.imagePlaceholder}>
                     <Text style={styles.placeholderText}>
                       No Image Available
                     </Text>
                   </View>
                 )}
               </View>

               <View style={styles.textContainer}>
                 <Text style={styles.propertyName}>{item.property_name}</Text>
                 <Text style={styles.propertyDetails}>
                   {item.address ? `Address: ${item.address}` : "No location"}
                 </Text>
                 <Text style={styles.propertyDetails}>
                   ETP: {item.price} Birr/day
                 </Text>
                 <Text style={styles.propertyDetails}>
                   Quantity: {item.quantity}{" "}
                 </Text>
               </View>

               <View style={styles.statusContainer}>
                 <Text
                   style={
                     item.status && item.quantity > 0
                       ? styles.available
                       : styles.rented
                   }
                 >
                   {item.status && item.quantity > 0
                     ? "Available"
                     : "Not Available"}
                 </Text>
               </View>
             </View>

             <View style={styles.buttonContainer}>
               <TouchableOpacity
                 style={styles.button}
                 onPress={() => handleEdit(item._id)}
               >
                 <Text style={styles.buttonText}>Edit</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.button, styles.deleteButton]}
                 onPress={() => handleDelete(item._id)}
               >
                 <Text style={styles.buttonText}>Delete</Text>
               </TouchableOpacity>
             </View>
           </View>
         )}
       />
      ) : loading ? (
        <View style={styles.loadingOverlay}>
         <RotatingDotsLoader />
        </View>
      ):(
        <Text
          style={
            theme === "dark"
              ? styles.noPropertiesTextDark
              : styles.noPropertiesTextLight
          }
        >
          No properties found.
        </Text>
      )}
      
    </View>
  );
};

export default withAuth(withRoleAccess(MyProperty, ["2", "3"]));
