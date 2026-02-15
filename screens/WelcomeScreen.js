import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats & Strength 💪</Text>

      <Text style={styles.subtitle}>
        Track your progress. Build real strength.
      </Text>

      <Link href="/info" asChild>
        <Pressable style={styles.buttonSecondary}>
          <Text style={styles.buttonTextDark}>About the App</Text>
        </Pressable>
      </Link>

      <Link href="/register" asChild>
        <Pressable style={styles.buttonPrimary}>
          <Text style={styles.buttonTextLight}>Register</Text>
        </Pressable>
      </Link>

      <Link href="/login" asChild>
        <Pressable style={styles.buttonSecondary}>
          <Text style={styles.buttonTextDark}>Login</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonPrimary: {
    backgroundColor: "#e10600",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#1c1c1c",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 12,
    width: "80%",
    alignItems: "center",
  },
  buttonTextLight: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDark: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "600",
  },
});

