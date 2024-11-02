import React from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
const FilteredSearchResults = ({ data = [] }) => {
  const navigation = useNavigation();
  // Ensure data is an array and filter based on the applied filters
  const filteredProperties = data.filter((property) => {
    // Ensure property fields are defined and are strings
    const propertyName = property.property_name?.toLowerCase() || "";
    const description = property.description?.toLowerCase() || "";
    const locationString = property.address?.toLowerCase() || "";
    
    // You can add more filtering logic here if needed
    return propertyName || description || locationString;
  });

  if (filteredProperties.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No properties found</Text>
      </View>
    );
  }
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {filteredProperties.map((item) => (
        <TouchableOpacity
          key={item._id.toString()}
          style={styles.itemContainer}
          onPress={() => {
            navigation.navigate("propertyDetail", {
              _id: item._id,
            });
          }}
        >
          <View style={styles.imageContainer}>
            {item.image && item.image[0] ? (
              <Image
                style={styles.image}
                source={{
                  uri: `https://renteasebackend-orna.onrender.com/uploads/${item.image[0]}`, // Use the first image if there are multiple
                }}
                onError={() => console.log("Error loading image")} // Optional error handling
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No Image Available</Text>
              </View>
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.propertyName}>{item.property_name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.priceLocation}>{item.address}</Text>
            <Text style={styles.priceLocation}>Quantity: {item.quantity}</Text>
            <Text style={styles.priceLocation}>ETP: {item.price} birr/day</Text>
            <Text>Rating: {item.average_rating || 0.0 }</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  itemContainer: {
    marginTop: 20,
    flexDirection: "row",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 15,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 120,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden", // Ensure the image fits within rounded corners
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Maintain aspect ratio
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    marginTop: 5,
    color: "#555",
  },
  priceLocation: {
    marginTop: 5,
    color: "#888",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
});

export default FilteredSearchResults;
