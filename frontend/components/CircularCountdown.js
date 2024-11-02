import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const CircularCountdown = ({ startDate, endDate }) => {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  // Calculate days remaining from start date to end date
  const calculateDaysRemaining = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const total = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Total days between start and end
    const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24)); // Days remaining from today to end
    return { daysRemaining: daysRemaining > 0 ? daysRemaining : 0, totalDays: total };
  };

  useEffect(() => {
    const { daysRemaining, totalDays } = calculateDaysRemaining(startDate, endDate);
    setDaysRemaining(daysRemaining);
    setTotalDays(totalDays);
  }, [startDate, endDate]);

  // Calculate the percentage of days remaining
  const remainingPercentage = (daysRemaining / totalDays) * 100;

  // Determine the text color based on the remaining percentage
  const textColor = remainingPercentage <= 50 ? "#4caf50" : "#ff5722"; // Red for less than or equal to 50%, green otherwise

  return (
    <View style={styles.container}>
      <Text style={[styles.countdownText, { color: textColor }]}>{daysRemaining}</Text>
      <Text style={[styles.daysText, { color: textColor }]}>days</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  countdownText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  daysText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
});

export default CircularCountdown;
