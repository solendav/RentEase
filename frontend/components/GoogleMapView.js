import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";

export default function GoogleMapView({ properties }) {
  const [mapRegion, setMapRegion] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const navigation = useNavigation(); // Use navigation

  useEffect(() => {
    if (properties.length > 0) {
      // Calculate the bounding region
      const latitudes = properties.map(
        (property) => property.location.latitude
      );
      const longitudes = properties.map(
        (property) => property.location.longitude
      );

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      setMapRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: maxLat - minLat + 0.1,
        longitudeDelta: maxLng - minLng + 0.1,
      });
    }
  }, [properties]);

  const handleMarkerPress = (property) => {
    setSelectedProperty(property);
  };

  const handleNavigateToDetail = () => {
    if (selectedProperty) {
      navigation.navigate("propertyDetail", { _id: selectedProperty._id });
    }
  };

  return (
    <View style={{ marginTop: 20, padding:10 }}>
      <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: "600", marginLeft:10,}}>
        Top NearBy Places
      </Text>
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <MapView
          style={styles.map}
          region={mapRegion}
          provider={PROVIDER_GOOGLE}
        >
          {properties.map((property) => (
            <Marker
              key={property._id}
              coordinate={{
                latitude: property.location.latitude,
                longitude: property.location.longitude,
              }}
              onPress={() => handleMarkerPress(property)}
            >
              <View style={styles.customMarker}>
                <Text style={styles.markerPrice}>${property.price}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {selectedProperty && (
        <TouchableOpacity
          style={styles.propertyDetails}
          onPress={handleNavigateToDetail}
        >
          <Image
            source={{
              uri:
                selectedProperty.image && selectedProperty.image.length > 0
                  ? `https://renteasebackend-orna.onrender.com/uploads/${selectedProperty.image[0]}`
                  : "https://via.placeholder.com/200x200.png?text=No+Image",
            }}
            style={styles.propertyImage}
          />
          <Text style={styles.propertyName}>
            {selectedProperty.property_name}
          </Text>
          <Text style={styles.propertyPrice}>
            Price: ${selectedProperty.price}
          </Text>
          <Text style={styles.propertyRatings}>
            Ratings: ⭐ {selectedProperty.average_rating} 
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 200,
    padding:20
  },
  customMarker: {
    backgroundColor: "#007bff",
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  markerPrice: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  propertyDetails: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  propertyPrice: {
    fontSize: 16,
    marginBottom: 5,
  },
  propertyRatings: {
    fontSize: 14,
  },
  propertyImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
});
