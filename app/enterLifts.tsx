// import { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   StyleSheet,
//   Alert,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { auth, db } from "../firebase/firebase";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { useAuthReady } from "../hooks/useAuthReady";

// export default function EnterLifts() {
//   const router = useRouter();
//   const authReady = useAuthReady();

//   const [liftType, setLiftType] = useState<"squat" | "bench" | "deadlift">(
//     "squat"
//   );
//   const [weight, setWeight] = useState("");
//   const [reps, setReps] = useState("");
//   const [saving, setSaving] = useState(false);

//   const showAlert = (title: string, message: string) => {
//     if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
//     else Alert.alert(title, message);
//   };

//   const weightSanitize = (v: string) => v.replace(/[^0-9.]/g, "");
//   const repsSanitize = (v: string) => v.replace(/[^\d]/g, "");

//   const validate = () => {
//     if (!weight || !reps) {
//       return { ok: false, msg: "Please fill in all fields." };
//     }

//     const w = Number(weight);
//     const r = Number(reps);

//     if (!/^\d{1,3}(\.\d{1,2})?$/.test(weight) || Number.isNaN(w)) {
//       return {
//         ok: false,
//         msg: "Weight must be a number (decimals allowed, e.g. 122.5).",
//       };
//     }

//     if (w < 20 || w > 500) {
//       return { ok: false, msg: "Weight looks unrealistic." };
//     }

//     if (!Number.isInteger(r) || r < 1 || r > 50) {
//       return { ok: false, msg: "Reps must be a whole number between 1–50." };
//     }

//     return { ok: true, msg: "" };
//   };

//   const validation = useMemo(validate, [weight, reps]);
//   const canSave = validation.ok && !saving;

//   const handleSave = async () => {
//     if (!authReady) return;

//     const user = auth.currentUser;
//     if (!user) {
//       showAlert("Not logged in", "Please log in again.");
//       router.replace("/login");
//       return;
//     }

//     if (!validation.ok) {
//       showAlert("Fix required", validation.msg);
//       return;
//     }

//     try {
//       setSaving(true);

//       await addDoc(
//         collection(db, "users", user.uid, "lifts"),
//             {
//             type: liftType,              // "squat" | "bench" | "deadlift"
//             weightKg: Number(weight),
//             reps: Number(reps),
//             createdAt: serverTimestamp(),
//             }
//         );

//       showAlert("Saved ✅", "Lift added successfully.");
//       router.replace("/myLifts");
//     } catch (e) {
//       showAlert("Error", "Failed to save lift. Try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Enter Lift</Text>

//       {/* Lift Type */}
//       <Text style={styles.section}>Lift Type</Text>
//       <View style={styles.row}>
//         {(["squat", "bench", "deadlift"] as const).map((t) => (
//           <Pressable
//             key={t}
//             style={[
//               styles.typeButton,
//               liftType === t && styles.typeButtonActive,
//             ]}
//             onPress={() => setLiftType(t)}
//           >
//             <Text
//               style={[
//                 styles.typeText,
//                 liftType === t && styles.typeTextActive,
//               ]}
//             >
//               {t.toUpperCase()}
//             </Text>
//           </Pressable>
//         ))}
//       </View>

//       {/* Weight */}
//       <Text style={styles.section}>Weight (kg)</Text>
//       <TextInput
//         placeholder="e.g. 122.5"
//         placeholderTextColor="#777"
//         keyboardType="numeric"
//         value={weight}
//         onChangeText={(t) => setWeight(weightSanitize(t))}
//         style={styles.input}
//       />

//       {/* Reps */}
//       <Text style={styles.section}>Reps</Text>
//       <TextInput
//         placeholder="e.g. 5"
//         placeholderTextColor="#777"
//         keyboardType="numeric"
//         value={reps}
//         onChangeText={(t) => setReps(repsSanitize(t))}
//         style={styles.input}
//       />

//       <Pressable
//         style={[styles.button, (!canSave || saving) && styles.buttonDisabled]}
//         onPress={handleSave}
//         disabled={!canSave || saving}
//       >
//         <Text style={styles.buttonText}>
//           {saving ? "Saving..." : "Save Lift"}
//         </Text>
//       </Pressable>

//       {!validation.ok && (
//         <Text style={styles.hint}>{validation.msg}</Text>
//       )}

//       <Pressable onPress={() => router.back()}>
//         <Text style={styles.back}>← Back</Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#111",
//     padding: 24,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   section: {
//     color: "#aaa",
//     marginBottom: 6,
//     marginTop: 12,
//   },
//   row: {
//     flexDirection: "row",
//     gap: 10,
//     marginBottom: 12,
//   },
//   typeButton: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 8,
//     backgroundColor: "#1c1c1c",
//     alignItems: "center",
//   },
//   typeButtonActive: {
//     backgroundColor: "#e10600",
//   },
//   typeText: {
//     color: "#aaa",
//     fontWeight: "600",
//   },
//   typeTextActive: {
//     color: "#fff",
//   },
//   input: {
//     backgroundColor: "#1c1c1c",
//     color: "#fff",
//     padding: 14,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   button: {
//     backgroundColor: "#e10600",
//     padding: 16,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   hint: {
//     color: "#aaa",
//     textAlign: "center",
//     marginTop: 12,
//   },
//   back: {
//     color: "#aaa",
//     textAlign: "center",
//     marginTop: 20,
//   },
// });




import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuthReady } from "../hooks/useAuthReady";

export default function EnterLifts() {
  const router = useRouter();
  const { user, loading } = useAuthReady();

  const [liftType, setLiftType] = useState<"squat" | "bench" | "deadlift">(
    "squat"
  );
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [saving, setSaving] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const weightSanitize = (v: string) => v.replace(/[^0-9.]/g, "");
  const repsSanitize = (v: string) => v.replace(/[^\d]/g, "");

  const validate = () => {
    if (!weight || !reps) {
      return { ok: false, msg: "Please fill in all fields." };
    }

    const w = Number(weight);
    const r = Number(reps);

    if (!/^\d{1,3}(\.\d{1,2})?$/.test(weight) || Number.isNaN(w)) {
      return {
        ok: false,
        msg: "Weight must be a number (decimals allowed, e.g. 122.5).",
      };
    }

    if (w < 20 || w > 500) {
      return { ok: false, msg: "Weight looks unrealistic." };
    }

    if (!Number.isInteger(r) || r < 1 || r > 50) {
      return { ok: false, msg: "Reps must be a whole number between 1–50." };
    }

    return { ok: true, msg: "" };
  };

  const validation = useMemo(validate, [weight, reps]);
  const canSave = validation.ok && !saving;

  const handleSave = async () => {
    if (loading) return;

    if (!user) {
      showAlert("Not logged in", "Please log in again.");
      router.replace("/login");
      return;
    }

    if (!validation.ok) {
      showAlert("Fix required", validation.msg);
      return;
    }

    try {
      setSaving(true);

      // ✅ FIXED: Save to top-level "lifts" collection
      await addDoc(collection(db, "lifts"), {
        userId: user.uid,
        type: liftType,
        weightKg: Number(weight),
        reps: Number(reps),
        createdAt: serverTimestamp(),
      });

      showAlert("Saved ✅", "Lift added successfully.");
      router.replace("/myLifts");
    } catch (e) {
      console.error(e);
      showAlert("Error", "Failed to save lift. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Lift</Text>

      {/* Lift Type */}
      <Text style={styles.section}>Lift Type</Text>
      <View style={styles.row}>
        {(["squat", "bench", "deadlift"] as const).map((t) => (
          <Pressable
            key={t}
            style={[
              styles.typeButton,
              liftType === t && styles.typeButtonActive,
            ]}
            onPress={() => setLiftType(t)}
          >
            <Text
              style={[
                styles.typeText,
                liftType === t && styles.typeTextActive,
              ]}
            >
              {t.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Weight */}
      <Text style={styles.section}>Weight (kg)</Text>
      <TextInput
        placeholder="e.g. 122.5"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={weight}
        onChangeText={(t) => setWeight(weightSanitize(t))}
        style={styles.input}
      />

      {/* Reps */}
      <Text style={styles.section}>Reps</Text>
      <TextInput
        placeholder="e.g. 5"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={reps}
        onChangeText={(t) => setReps(repsSanitize(t))}
        style={styles.input}
      />

      <Pressable
        style={[styles.button, (!canSave || saving) && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!canSave || saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Save Lift"}
        </Text>
      </Pressable>

      {!validation.ok && (
        <Text style={styles.hint}>{validation.msg}</Text>
      )}

      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
    </View>
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
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1c1c1c",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#e10600",
  },
  typeText: {
    color: "#aaa",
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#e10600",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 12,
  },
  back: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});
