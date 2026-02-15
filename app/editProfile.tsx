import { useEffect, useMemo, useState } from "react";
import { useAuthReady } from "../hooks/useAuthReady";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function EditProfile() {
  const router = useRouter();

  // ✅ Auth-safe hook
  const { user, loading } = useAuthReady();

  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const numbersOnly = (s: string) => s.replace(/[^\d]/g, "");
  const weightSanitize = (s: string) => s.replace(/[^0-9.]/g, "");

  const computeAge = (d: number, m: number, y: number) => {
    const today = new Date();
    const dob = new Date(y, m - 1, d);
    let age = today.getFullYear() - dob.getFullYear();
    const md = today.getMonth() - dob.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const validateAll = () => {
    const cleanName = name.trim();

    if (!cleanName || !day || !month || !year || !feet || !inches || !weight) {
      return { ok: false, msg: "Please fill in all fields." };
    }

    if (!/^[A-Za-z\s-]+$/.test(cleanName)) {
      return { ok: false, msg: "Name must contain letters only." };
    }

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    const dob = new Date(y, m - 1, d);
    if (
      Number.isNaN(d) ||
      Number.isNaN(m) ||
      Number.isNaN(y) ||
      dob.getDate() !== d ||
      dob.getMonth() !== m - 1 ||
      dob.getFullYear() !== y
    ) {
      return { ok: false, msg: "Date of Birth is invalid." };
    }

    const age = computeAge(d, m, y);
    if (age < 5 || age > 120) {
      return { ok: false, msg: "Age looks unrealistic." };
    }

    const ft = parseInt(feet, 10);
    const inch = parseInt(inches, 10);
    if (ft < 3 || ft > 8 || inch < 0 || inch > 11) {
      return { ok: false, msg: "Height is invalid." };
    }

    const w = Number(weight);
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(weight) || w < 20 || w > 400) {
      return { ok: false, msg: "Weight is invalid." };
    }

    return { ok: true, msg: "" };
  };

  const validation = useMemo(validateAll, [
    name,
    day,
    month,
    year,
    feet,
    inches,
    weight,
  ]);

  const canSave = validation.ok && !saving && !loadingProfile;

  // ✅ SAFE profile load (waits for auth)
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data: any = snap.data();
          setName(data?.name ?? "");
          setDay(String(data?.dobDay ?? ""));
          setMonth(String(data?.dobMonth ?? ""));
          setYear(String(data?.dobYear ?? ""));
          setFeet(String(data?.heightFeet ?? ""));
          setInches(String(data?.heightInches ?? ""));
          setWeight(
            data?.weightKg !== undefined ? String(data.weightKg) : ""
          );
        }
      } catch {
        showAlert("Load failed", "Could not load profile.");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [loading, user]);

  const handleSave = async () => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const v = validateAll();
    if (!v.ok) {
      showAlert("Fix required", v.msg);
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          dobDay: Number(day),
          dobMonth: Number(month),
          dobYear: Number(year),
          heightFeet: Number(feet),
          heightInches: Number(inches),
          weightKg: Number(weight),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      showAlert("Saved ✅", "Profile updated.");
      router.replace("/mainMenu");
    } catch {
      showAlert("Save failed", "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#111" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Profile</Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.section}>Date of Birth</Text>
        <View style={styles.row}>
          <TextInput
            placeholder="DD"
            keyboardType="numeric"
            value={day}
            onChangeText={(t) => setDay(numbersOnly(t).slice(0, 2))}
            style={[styles.input, styles.smallInput]}
          />
          <TextInput
            placeholder="MM"
            keyboardType="numeric"
            value={month}
            onChangeText={(t) => setMonth(numbersOnly(t).slice(0, 2))}
            style={[styles.input, styles.smallInput]}
          />
          <TextInput
            placeholder="YYYY"
            keyboardType="numeric"
            value={year}
            onChangeText={(t) => setYear(numbersOnly(t).slice(0, 4))}
            style={[styles.input, styles.yearInput]}
          />
        </View>

        <Text style={styles.section}>Height</Text>
        <View style={styles.row}>
          <TextInput
            placeholder="Feet"
            keyboardType="numeric"
            value={feet}
            onChangeText={(t) => setFeet(numbersOnly(t))}
            style={[styles.input, styles.smallInput]}
          />
          <TextInput
            placeholder="Inches"
            keyboardType="numeric"
            value={inches}
            onChangeText={(t) => setInches(numbersOnly(t))}
            style={[styles.input, styles.smallInput]}
          />
        </View>

        <Text style={styles.section}>Weight (kg)</Text>
        <TextInput
          placeholder="e.g. 89.9"
          keyboardType="numeric"
          value={weight}
          onChangeText={(t) => setWeight(weightSanitize(t))}
          style={styles.input}
        />

        <Pressable
          style={[styles.button, !canSave && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>

        {!validation.ok && <Text style={styles.hint}>{validation.msg}</Text>}

        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Back to Main Menu</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  section: { color: "#aaa", marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    flex: 1,
  },
  row: { flexDirection: "row", gap: 10 },
  smallInput: { flex: 1 },
  yearInput: { flex: 2 },
  button: {
    backgroundColor: "#e10600",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  hint: { color: "#aaa", textAlign: "center", marginTop: 12 },
  back: { color: "#aaa", textAlign: "center", marginTop: 15 },
});
