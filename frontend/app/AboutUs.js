import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
const windowWidth = Dimensions.get("window").width;

const AboutUs = () => {
  const handleBackPress = () => {
    router.back(); // Use router.back() to navigate to the previous screen
  };
  const router = useRouter();
  return (
    <View style={styles.container}>
    <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f5d"]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#fff" /> 
        </TouchableOpacity>
        <Text style={styles.title}>About Us </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
        <Image
                source={require("./../assets/images/logos.png")} // Use the correct path to your image
                style={styles.logo}
              />
          <Text style={styles.description}>
          Welcome to RentEase!
We are dedicated to making renting easier and more convenient, 
whether you're looking for a place to live, a vehicle to drive, 
or equipment to use. Our mission is to provide seamless, efficient, 
and secure rental experiences for both renters and owners.

With a focus on user-friendly technology, transparency, 
and customer satisfaction, we strive to connect renters with the 
right options and ensure owners have a hassle-free way to manage their rentals.
Whether you're renting a home, a car, or other essential items, 
RentEase is here to support you at every step. Let us simplify your rental journey!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Our Team</Text>
          <View style={styles.teamContainer}>
            <View style={styles.teamMember}>
            <Image
                source={require("./../assets/images/solen.jpg")} // Use the correct path to your image
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>solomon Dawit</Text>
              <Text style={styles.teamRole}>FullStack Depeloper</Text>
            </View>
            <View style={styles.teamMember}>
              <Image
                source={require("./../assets/images/bam.jpg")} // Use the correct path to your image
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Bamlakfekad Tatek</Text>
              <Text style={styles.teamRole}>Backend Depeloper</Text>
            </View>
            <View style={styles.teamMember}>
              <Image
                source={require("./../assets/images/bef.jpg")} // Use the correct path to your image
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Befikir Enawgaw</Text>
              <Text style={styles.teamRole}>Frontend Developer</Text>
            </View>
          </View>
          <View style={styles.teamContainer}>
            <View style={styles.teamMember}>
              <Image
                source={require("./../assets/images/nigus.jpg")} // Use the correct path to your image
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Nigus Shiferaw</Text>
              <Text style={styles.teamRole}>Backend Depeloper</Text>
            </View>
            <View style={styles.teamMember}>
              <Image
                source={require("./../assets/images/bereket.jpg")} // Use the correct path to your image
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Bereket Fekadu</Text>
              <Text style={styles.teamRole}>Frontend Developer</Text>
            </View>
            <View style={styles.teamMember}>
              <Image
                source={require("./../assets/images/dagi.jpg")} // Use the correct path to your image
                style={styles.teamImage}
              />
              <Text style={styles.teamName}>Dagim Wondim</Text>
              <Text style={styles.teamRole}>Frontend Developer</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Contact Us</Text>
          <Text style={styles.description}>
            We'd love to hear from you! If you have any questions or feedback,
            feel free to reach out to us:
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("ReantEase01@gmail.com")}
          >
            <Text style={styles.contactLink}>ReantEase01@gmail.com</Text>
          </TouchableOpacity>
          <Text style={styles.description}>
            or call us at: +251 912-345-678
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative", // Ensure that the back button can be positioned absolutely
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 20,
    padding: 10,
    zIndex: 1, // Ensure the button is above other elements
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  section: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 10,
    elevation: 2,
  },
  logo: {
    width: windowWidth * 0.7,
    height: windowWidth * 0.4,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  teamContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  teamMember: {
    width: windowWidth * 0.28,
    alignItems: "center",
    marginBottom: 15,
  },
  teamImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  teamRole: {
    fontSize: 14,
    color: "#666",
  },
  contactLink: {
    fontSize: 16,
    color: "#1E90FF",
    textAlign: "center",
  },
});

export default AboutUs;
