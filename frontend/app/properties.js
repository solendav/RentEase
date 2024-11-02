import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import SearchResults from "../components/SearchResults";
import withAuth from './../components/withAuth'
const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const response = await axios.get(
          "https://renteasebackend-orna.onrender.com/properties" // Replace with your actual API endpoint
        );
        setProperties(response.data);
      } catch (error) {
        setError("Error fetching property data. Please try again later.");
        console.error("Error fetching property data:", error);
      }
    };

    fetchPropertyData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          onPress={() => router.back()}
          style={styles.backButton}
          name="arrow-back"
          size={24}
          color="black"
        />
        <Pressable style={styles.searchContainer}>
          <Ionicons name="search" size={20} style={styles.searchIcon} />
          <TextInput
            value={input}
            onChangeText={(text) => setInput(text)}
            style={styles.searchInput}
            placeholder="Search"
          />
          {properties.length > 0 && (
            <View>
              <Pressable onPress={() => router.push("addProperty")}>
                <AntDesign name="pluscircle" size={30} color="#0072b1" />
              </Pressable>
            </View>
          )}
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text>{error}</Text>
        </View>
      ) : properties.length > 0 ? (
        <SearchResults data={properties} input={input} />
      ) : (
        <View style={styles.noDataContainer}>
          <Text>No Data</Text>
          <Text>Press on the plus button and add your Property</Text>
          <Pressable onPress={() => router.push("addProperty")}>
            <AntDesign
              style={styles.addButton}
              name="pluscircle"
              size={24}
              color="black"
            />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginTop: 30,
  },
  backButton: {
    marginLeft: 30,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 9,
    gap: 10,
    height: 40,
    flex: 1,
    backgroundColor: "#efefef",
    borderRadius: 20,
  },
  searchIcon: {
    color: Colors.PRIMARY,
    marginHorizontal: 10,
  },
  searchInput: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    marginTop: 30,
  },
});

export default withAuth(Properties);
