import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const isValidEmail = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleRegister = async (): Promise<void> => {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      showAlert("Missing details", "Email and password are required.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      showAlert("Invalid email", "Please enter a valid email address.");
      return;
    }

    const strongPassword =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!strongPassword) {
      showAlert(
        "Weak password",
        "Password must be 8+ characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await sendEmailVerification(userCredential.user);

      if (Platform.OS === "web") {
        window.alert(
          "Verify your email 📧\n\nA verification email has been sent. Verify it, then log in."
        );
        router.push("/login");
      } else {
        Alert.alert(
          "Verify your email 📧",
          "A verification email has been sent. Please verify your email before logging in.",
          [{ text: "Go to Login", onPress: () => router.push("/login") }]
        );
      }
    } catch (error: any) {
      const message: string = error?.message || "Registration failed.";

      if (message.includes("auth/email-already-in-use")) {
        showAlert("Email already registered", "Try logging in instead.");
      } else if (message.includes("auth/invalid-email")) {
        showAlert("Invalid email", "Please enter a valid email.");
      } else if (message.includes("auth/weak-password")) {
        showAlert("Weak password", "Please choose a stronger password.");
      } else {
        showAlert("Registration failed", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 💪</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#777"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Register"}
        </Text>
      </Pressable>

      <Link href="/login" asChild>
        <Pressable>
          <Text style={styles.link}>Already have an account? Login</Text>
        </Pressable>
      </Link>

      <Link href="/" asChild>
        <Pressable>
          <Text style={styles.back}>Back to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#111",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#e10600",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 15,
  },
  back: {
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
});


