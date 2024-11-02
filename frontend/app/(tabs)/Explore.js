import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import SearchResults from "./../../components/SearchResults";
import FilteredSearchResults from "./../../components/FilteredSearchResults";
import GoogleMapView from "../../components/GoogleMapView"; // Import the GoogleMapView component
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Colors } from "../../constants/Colors";

const Explore = () => {
  const [properties, setProperties] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [filterPressed, setFilterPressed] = useState(false);
  const route = useRoute();

  // State for managing filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const categories = [
    "House",
    "Vehicle",
    "Electronics",
    "Event-Equipment",
    "Cloth",
    "Other",
  ];

  useEffect(() => {
    // Fetch property data when the component mounts
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          "https://rentease-1-n9w2.onrender.com/properties"
        );
        setProperties(response.data || []);
        setSearchResults(response.data || []);
        setFilteredResults([]);
      } catch (error) {
        
        console.log("Error fetching property data:", error);
      }
    };

    fetchProperties();
  }, []);

  // Function to apply search criteria
  const applySearch = () => {
    if (input) {
      const results = (Array.isArray(properties) ? properties : []).filter(
        (property) =>
          property.property_name.toLowerCase().includes(input.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(properties);
    }
  };

  // Function to apply filter criteria
  const applyFilters = (results) => {
    if (!Array.isArray(results)) {
      console.log("Results is not an array", results);
      return [];
    }

    let filtered = results;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (property) => property.category === selectedCategory
      );
    }

    // Apply price filter
    if (selectedPrice) {
      const [minPrice, maxPrice] = selectedPrice.split(" - ").map(Number);
      filtered = filtered.filter(
        (property) => property.price >= minPrice && property.price <= maxPrice
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter((property) =>
        property.address.includes(selectedLocation)
      );
    }

    // Apply quantity filter
    if (selectedQuantity) {
      filtered = filtered.filter(
        (property) => property.quantity.toString() === selectedQuantity
      );
    }

    // Apply rating filter
    if (selectedRating) {
      const rating = parseInt(selectedRating);
      filtered = filtered.filter(
        (property) => property.average_rating >= rating
      );
    }

    return filtered;
  };

  // Apply search and then filters
  const applySearchAndFilters = () => {
    applySearch();
    const filtered = applyFilters(searchResults);
    setFilteredResults(filtered);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 450, animated: true }); // Adjust y value as needed
    }
  };

  const toggleFilter = () => {
    console.log("Filter button pressed");
    setFilterPressed(!filterPressed);
  };

  const fetchPropertyData = async () => {
    try {
      const response = await axios.get(
        "https://rentease-1-n9w2.onrender.com/properties"
      );
      setProperties(response.data || []);
    } catch (error) {
      
      console.log("Error fetching property data:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPropertyData();
      setInput("");
      setSelectedCategory(null);
      setSelectedPrice(null);
      setSelectedLocation(null);
      setSelectedQuantity(null);
      setSelectedRating(null);
      // Focus the TextInput when the screen is focused
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }

      // Check if filterPressed parameter exists and update state
      if (route.params?.filterPressed !== undefined) {
        setFilterPressed(route.params.filterPressed);
        if (route.params.filterPressed) {
          applySearchAndFilters(); // Automatically apply filters if filterPressed is true
        }
      }
    }, [route.params?.filterPressed])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.searchContainer}>
          <Ionicons name="search" size={20} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            value={input}
            onChangeText={(text) => {
              setInput(text);
              applySearchAndFilters(); // Automatically apply search and filters as user types
            }}
            style={styles.searchInput}
            placeholder="Search"
          />
        </Pressable>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterPressed ? styles.filterButtonPressed : styles.filterButton,
          ]}
          onPress={toggleFilter}
        >
          <Ionicons
            name="options"
            size={36}
            style={[
              styles.filterIcon,
              filterPressed ? styles.filterIconPressed : styles.filterIcon,
            ]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        ref={scrollViewRef}
      >
        {/* Display the map only when the input is not empty and there are filtered results */}
        {input.trim() !== "" && filteredResults.length > 0 && (
          <View style={styles.mapContainer}>
            <GoogleMapView properties={filteredResults} />
          </View>
        )}

        {/* Render placeholder or results */}
        {!searchResults.length && !filteredResults.length ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Please search or apply filters to see results.
            </Text>
          </View>
        ) : (
          <>
            {searchResults.length > 0 && !filterPressed && (
              <SearchResults data={searchResults} input={input} />
            )}
            {filterPressed && (
              <>
                <FilterScroll
                  title="Category"
                  options={categories}
                  selectedOption={selectedCategory}
                  setSelectedOption={setSelectedCategory}
                />
                <FilterScroll
                  title="Price"
                  options={[
                    "0 - 1000",
                    "1000 - 2000",
                    "2000 - 3000",
                    "3000-5000",
                    "5000-10000",
                  ]}
                  selectedOption={selectedPrice}
                  setSelectedOption={setSelectedPrice}
                />
                <FilterScroll
                  title="Location"
                  options={[
                    "Addis Ababa",
                    "Dire Dawa",
                    "Mekelle",
                    "Bahir Dar",
                    "Gondar",
                    "Hawassa",
                    "Jimma",
                    "Adama",
                    "Awasa",
                    "Jijiga",
                  ]}
                  selectedOption={selectedLocation}
                  setSelectedOption={setSelectedLocation}
                />

                <FilterScroll
                  title="Quantity"
                  options={["1", "2", "3", "4", "5+"]}
                  selectedOption={selectedQuantity}
                  setSelectedOption={setSelectedQuantity}
                />
                <FilterScroll
                  title="Rating"
                  options={[
                    "1 Star",
                    "2 Stars",
                    "3 Stars",
                    "4 Stars",
                    "5 Stars",
                  ]}
                  selectedOption={selectedRating}
                  setSelectedOption={setSelectedRating}
                />
                <TouchableOpacity
                  style={styles.seeResultsButton}
                  onPress={applySearchAndFilters}
                >
                  <Text style={styles.seeResultsButtonText}>See Results</Text>
                </TouchableOpacity>
                <FilteredSearchResults data={filteredResults} />
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const FilterScroll = ({
  title,
  options,
  selectedOption,
  setSelectedOption,
}) => {
  return (
    <View style={styles.filterScrollContainer}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterOption,
              selectedOption === option ? styles.selectedFilterOption : null,
            ]}
            onPress={() => {
              if (selectedOption === option) {
                // Deselect if already selected
                setSelectedOption(null);
              } else {
                // Select new option
                setSelectedOption(option);
              }
            }}
          >
            <Text
              style={
                selectedOption === option
                  ? { color: "white" }
                  : { color: Colors.darkGray }
              }
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f8f8f8",
  },
  searchIcon: {
    color: "#888",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    padding: 8,
  },
  filterButtonPressed: {
    backgroundColor: "#ddd",
  },
  filterIcon: {
    color: Colors.BLACK,
  },
  filterIconPressed: {
    color: Colors.PRIMARY,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: "#888",
  },
 
  filterScrollContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  filterOption: {
    backgroundColor: "#eaeaea",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginRight: 10,
  },
  selectedFilterOption: {
    backgroundColor: Colors.PRIMARY,
  },
  seeResultsButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  seeResultsButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Explore;
