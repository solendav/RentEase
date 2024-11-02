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
const windowWidth = Dimensions.get("window").width;

const AboutUs = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f5d"]}
        style={styles.header}
      >
        <Text style={styles.title}>About Us</Text>
      </LinearGradient>

      <View style={styles.section}>
        <Image
          source={{ uri: "https://via.placeholder.com/200.png?text=Logo" }} // Replace with your company logo URL
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
              source={{
                uri: "https://via.placeholder.com/100.png?text=John+Doe",
              }} // Replace with team member photo URL
              style={styles.teamImage}
            />
            <Text style={styles.teamName}>John Doe</Text>
            <Text style={styles.teamRole}>CEO</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              source={{
                uri: "https://via.placeholder.com/100.png?text=Jane+Smith",
              }} // Replace with team member photo URL
              style={styles.teamImage}
            />
            <Text style={styles.teamName}>Jane Smith</Text>
            <Text style={styles.teamRole}>CTO</Text>
          </View>
          <View style={styles.teamMember}>
            <Image
              source={{
                uri: "https://via.placeholder.com/100.png?text=Alex+Johnson",
              }} // Replace with team member photo URL
              style={styles.teamImage}
            />
            <Text style={styles.teamName}>Alex Johnson</Text>
            <Text style={styles.teamRole}>Lead Developer</Text>
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
          onPress={() => Linking.openURL("mailto:support@yourapp.com")}
        >
          <Text style={styles.contactLink}>support@yourapp.com</Text>
        </TouchableOpacity>
        <Text style={styles.description}>or call us at: (123) 456-7890</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
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
    width: windowWidth * 0.6,
    height: windowWidth * 0.3,
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
