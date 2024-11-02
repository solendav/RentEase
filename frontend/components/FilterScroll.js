import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import Material Icons

const categoryIconMap = {
  House: "home",
  Car: "directions-car",
  Electronics: "devices",
  Book: "book",
  Shoes: "sports-soccer",
  Clothes: "shirt",
  Apartment: "apartment",
};

const FilterScroll = ({
  categories = [],
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <View style={styles.filterScrollContainer}>
      <Text style={styles.filterTitle}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterOption,
                selectedCategory === category
                  ? styles.selectedFilterOption
                  : null,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Icon
                name={categoryIconMap[category] || "category"} // Get the icon based on the category
                size={20}
                color={selectedCategory === category ? "white" : "black"}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.optionText,
                  selectedCategory === category && styles.selectedOptionText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noCategoriesText}>No categories available</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaeaea",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  selectedFilterOption: {
    backgroundColor: "#7F57F1",
  },
  icon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: "white",
  },
  noCategoriesText: {
    fontSize: 16,
    color: "gray",
  },
});

export default FilterScroll;
