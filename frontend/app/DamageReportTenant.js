import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import Swiper from "react-native-swiper";
import Header from "./../components/Header";

const DamageReportTenant = () => {
  const route = useRoute();
  const { bookingId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estimation, setEstimation] = useState(0);

  useEffect(() => {
    console.log("Booking ID:", bookingId);

    const fetchDamageReport = async () => {
      try {
        const response = await axios.get(
          `https://renteasebackend-orna.onrender.com/api/damage-report/${bookingId}`
        );
        console.log("Response:", response.data);

        // Ensure response data contains _id
        if (response.data && response.data._id) {
          setReport(response.data);
          setEstimation(response.data.estimation);
        } else {
          console.error(
            "Error: _id is missing in the response data:",
            response.data
          );
          Alert.alert("Error", "Report ID is missing in the response data.");
        }
      } catch (error) {
        console.error(
          "Error fetching damage report:",
          error.response || error.message
        );
        Alert.alert(
          "Error",
          "Failed to fetch damage report. Check console for details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDamageReport();
  }, [bookingId]);

  const handleAgree = async () => {
    if (!report || !report._id) {
      Alert.alert("Error", "Report ID is missing.");
      console.error("Error: report or report ID is missing:", report);
      return;
    }

    try {
      console.log(
        "Sending request with report ID:",
        report._id,
        "and estimation:",
        estimation
      );

      const response = await axios.post(
        `https://renteasebackend-orna.onrender.com/damage-report/agree`,
        {
          damageReportId: report._id, // Ensure report._id is present
          estimation,
        }
      );
      Alert.alert(
        "Success",
        "Amount deducted from frozen balance and transferred."
      );
    } catch (error) {
      if (error.response) {
        console.error("Error data:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else {
        console.error("Error message:", error.message);
      }
      Alert.alert("Error", "Failed to process agreement.");
    }
  };

  const handleDisagree = async () => {
    if (!report || !report._id) {
      Alert.alert("Error", "Report ID is missing.");
      console.error("Error: report or report ID is missing:", report);
      return;
    }

    try {
      await axios.post(`https://renteasebackend-orna.onrender.com/damage-report/disagree`, {
        damageReportId: report._id, // Ensure report._id is present
      });

      Alert.alert("Success", "Marked as disagreed.");
    } catch (error) {
      console.error(
        "Error data:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "Failed to process disagreement.");
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!report) {
    return <Text>No damage report found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Header title="" />
      <Text style={styles.header}>Damage Report</Text>
      <View style={styles.imageContainer}>
        <Swiper
          style={styles.imageSwiper}
          showsPagination
          paginationStyle={styles.paginationStyle}
          dotStyle={styles.dotStyle}
          activeDotStyle={styles.activeDotStyle}
          loop={true}
          autoplay={true}
          autoplayTimeout={5}
        >
          {report.image && report.image.length > 0 ? (
            report.image.map((image, index) => (
              <Image
                key={index}
                source={{ uri: `https://renteasebackend-orna.onrender.com/uploads/${image}` }}
                style={styles.image}
                resizeMode="cover"
              />
            ))
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
        </Swiper>
      </View>

      <View style={styles.reportDetails}>
        <Text style={styles.detail}>Description</Text>
        <Text style={styles.detail}>{report.description}</Text>

        <Text style={styles.detail}>Estimation: ${report.estimation}</Text>
        <Text style={styles.detail}>
          Date: {new Date(report.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.buttonAgree} onPress={handleAgree}>
          <Text style={styles.buttonText}>Agree</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonDisagree}
          onPress={handleDisagree}
        >
          <Text style={styles.buttonText}>Disagree</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageContainer: {
    height: 300,
    marginBottom: 20,
  },
  imageSwiper: {
    height: 300,
  },
  image: {
    width: Dimensions.get("window").width - 40,
    height: 250,
    borderRadius: 15,
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 300,
    backgroundColor: "#dcdcdc",
    borderRadius: 15,
  },
  noImageText: {
    color: "#666",
    fontSize: 16,
  },
  reportDetails: {
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    marginVertical: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonAgree: {
    backgroundColor: "#28A745",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonDisagree: {
    backgroundColor: "#DC3545",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DamageReportTenant;
