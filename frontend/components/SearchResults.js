import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const SearchResults = ({ data, input = "" }) => {
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (input.trim() !== "") {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [input]);

  const searchTerm = input.toLowerCase();

  const filteredProperties = isSearching
    ? data.filter((property) => {
        const propertyName = property.property_name?.toLowerCase() || "";
        const description = property.description?.toLowerCase() || "";
        const locationString = property.address?.toLowerCase() || "";

        return (
          propertyName.includes(searchTerm) ||
          description.includes(searchTerm) ||
          locationString.includes(searchTerm)
        );
      })
    : [];

  if (isSearching && filteredProperties.length === 0) {
    return <Text style={styles.emptyText}>No properties found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {filteredProperties.length === 0 && !isSearching ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        filteredProperties.map((item, index) => (
          <TouchableOpacity
            key={item.property_id || item._id || index} // Fallback to _id or index if property_id is not available
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
                    uri: `https://renteasebackend-orna.onrender.com/uploads/${item.image[0]}`,
                  }}
                  onError={() => console.log("Error loading image")}
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
              <Text style={styles.priceLocation}>ETP: {item.price} birr/day</Text>
              <Text style={styles.priceLocation}>⭐{item.average_rating}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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

export default SearchResults;
