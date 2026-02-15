import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function OneRepMax() {
  const router = useRouter();

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const sanitizeWeight = (v: string) => v.replace(/[^0-9.]/g, "");
  const sanitizeReps = (v: string) => v.replace(/[^\d]/g, "");

  const validation = useMemo(() => {
    if (!weight || !reps) {
      return { ok: false, msg: "Enter weight and reps." };
    }

    const w = Number(weight);
    const r = Number(reps);

    if (!/^\d{1,4}(\.\d{1,2})?$/.test(weight) || Number.isNaN(w)) {
      return { ok: false, msg: "Enter a valid weight (e.g. 122.5)." };
    }

    if (!Number.isInteger(r) || r < 1 || r > 20) {
      return { ok: false, msg: "Reps must be between 1–20." };
    }

    if (w < 20 || w > 500) {
      return { ok: false, msg: "Weight looks unrealistic." };
    }

    return { ok: true, msg: "" };
  }, [weight, reps]);

  const oneRM = useMemo(() => {
    if (!validation.ok) return 0;
    const w = Number(weight);
    const r = Number(reps);
    return w * (1 + r / 30);
  }, [validation, weight, reps]);

  const repTable = useMemo(() => {
    if (!validation.ok) return [];

    const table = [];
    for (let i = 1; i <= 10; i++) {
      const estimated = oneRM / (1 + i / 30);
      table.push({
        reps: i,
        weight: Math.round(estimated * 10) / 10,
      });
    }
    return table;
  }, [oneRM, validation]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>1 Rep Max Calculator 💪</Text>

      <Text style={styles.section}>Weight Lifted (kg)</Text>
      <TextInput
        placeholder="e.g. 140"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={weight}
        onChangeText={(t) => setWeight(sanitizeWeight(t))}
        style={styles.input}
      />

      <Text style={styles.section}>Reps Performed</Text>
      <TextInput
        placeholder="e.g. 5"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={reps}
        onChangeText={(t) => setReps(sanitizeReps(t))}
        style={styles.input}
      />

      {!validation.ok && (
        <Text style={styles.hint}>{validation.msg}</Text>
      )}

      {validation.ok && (
        <View style={styles.card}>
          <Text style={styles.resultTitle}>
            Estimated 1RM: {Math.round(oneRM * 10) / 10} kg
          </Text>

          {repTable.map((row) => (
            <View key={row.reps} style={styles.tableRow}>
              <Text style={styles.tableReps}>{row.reps} RM</Text>
              <Text style={styles.tableWeight}>{row.weight} kg</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/mainMenu")}
      >
        <Text style={styles.buttonText}>Back to Menu</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    color: "#aaa",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  hint: {
    color: "#ff4d4d",
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#1c1c1c",
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e10600",
    marginBottom: 12,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  tableReps: {
    color: "#fff",
  },
  tableWeight: {
    color: "#ccc",
  },
  button: {
    backgroundColor: "#e10600",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
