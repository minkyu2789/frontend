import { StyleSheet, Text, View } from "react-native";

export function Nearby() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>여행자 밍글러</Text>
      <View style={styles.placeholderBox} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F2F5",
    alignItems: "center",
    paddingTop: 80,
  },
  header: {
    fontSize: 36 / 2,
    fontWeight: "700",
    color: "#111",
    marginBottom: 34,
  },
  placeholderBox: {
    width: 318,
    height: 464,
    backgroundColor: "#D9D9D9",
  },
});
