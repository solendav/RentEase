import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { Colors } from "../constants/Colors";

const RotatingDotsLoader = () => {
  const rotate = useRef(new Animated.Value(0)).current;
  const dotCount = 8; // Number of dots
  const radius = 20; // Radius of the circle
  const dotSize = 10; // Size of each dot

  useEffect(() => {
    const animationDuration = 2000; // Increased duration for slower animation

    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
        easing: Easing.linear, // Continuous rotation
      })
    );

    rotateAnimation.start();
  }, [rotate]);

  const dots = [...Array(dotCount).keys()];

  // Calculate rotation for the entire loader
  const rotateInterpolation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"], // Rotate the loader around the center
  });

  // Calculate opacity for each dot
  const dotOpacity = rotate.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0], // Opacity transitions from 0 to 1 and back to 0
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.loader,
          { transform: [{ rotate: rotateInterpolation }] },
        ]}
      >
        {dots.map((i) => {
          const angle = (i / dotCount) * 2 * Math.PI;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          // Calculate phase shift for each dot to stagger the opacity transition
          const phaseShift = i / dotCount;
          const dotAnimatedOpacity = rotate.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0 + phaseShift, 1 + phaseShift, 0 + phaseShift],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  transform: [{ translateX: x }, { translateY: y }],
                  opacity: dotAnimatedOpacity,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#fff',
    height:90,
    width:90,
    borderRadius:20

  },
  loader: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: 'transparent',
  },
  dot: {
    borderRadius: 5,
    backgroundColor:Colors.PRIMARY,
    position: "absolute",
  },
});

export default RotatingDotsLoader;
