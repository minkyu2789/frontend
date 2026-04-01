import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Chats() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="chevron-back" size={26} color="#111" />
        <Text style={styles.headerTitle}>USER2043</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.messageArea} />

      <View style={styles.inputArea}>
        <Text style={styles.inputPlaceholder}>메시지를 입력하세요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F2F5",
    paddingTop: 54,
  },
  headerRow: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  headerTitle: {
    fontSize: 36 / 2,
    fontWeight: "700",
    color: "#111",
  },
  rightSpacer: {
    width: 26,
  },
  messageArea: {
    flex: 1,
  },
  inputArea: {
    marginHorizontal: 22,
    marginBottom: 24,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1D1D1",
    alignItems: "center",
    justifyContent: "center",
  },
  inputPlaceholder: {
    color: "#8a8a8a",
    fontSize: 14,
  },
});
