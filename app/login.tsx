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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function Login() {
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

  const handleLogin = async (): Promise<void> => {
    const cleanEmail = email.trim();

    // 🔒 Validation
    if (!cleanEmail || !password) {
      showAlert("Missing details", "Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = userCredential.user;

      // ❌ Email not verified
      if (!user.emailVerified) {
        showAlert(
          "Email not verified",
          "Please verify your email before logging in."
        );
        return;
      }

      // ✅ Login success
      showAlert("Login successful ✅", "Welcome back!");
      router.replace("/mainMenu");
    } catch (error: any) {
      const message: string = error?.message || "Login failed.";

      if (message.includes("auth/user-not-found")) {
        showAlert("Account not found", "No account exists with that email.");
      } else if (message.includes("auth/wrong-password")) {
        showAlert("Incorrect password", "The password you entered is incorrect.");
      } else if (message.includes("auth/invalid-email")) {
        showAlert("Invalid email", "Please enter a valid email address.");
      } else {
        showAlert("Login failed", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 💪</Text>

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
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Link href="/register" asChild>
        <Pressable>
          <Text style={styles.link}>Don’t have an account? Register</Text>
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
