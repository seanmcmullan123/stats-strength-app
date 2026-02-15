import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { db } from "../firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuthReady } from "../hooks/useAuthReady";

type LiftType = "squat" | "bench" | "deadlift";

type LiftDoc = {
  id: string;
  type: LiftType;
  reps: number;
  weightKg: number;
  createdAt?: any;
};

export default function MyLifts() {
  const router = useRouter();
  const { user, loading } = useAuthReady(); // ✅ FIXED

  const [lifts, setLifts] = useState<LiftDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  // ✅ SAFE auth redirect (NO router crash)
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user]);

  // ✅ Load lifts AFTER auth is resolved
  useEffect(() => {
    if (loading || !user) return;

    setDataLoading(true);

    const q = query(
      collection(db, "lifts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: LiftDoc[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            type: data.type,
            reps: Number(data.reps ?? 0),
            weightKg: Number(data.weightKg ?? 0),
            createdAt: data.createdAt,
          };
        });

        setLifts(rows);
        setDataLoading(false);
      },
      (err) => {
        console.error(err);
        setDataLoading(false);
        showAlert(
          "Load failed",
          "Could not load lifts. If Firestore shows an index error, create the index."
        );
      }
    );

    return () => unsub();
  }, [loading, user]);

  // const grouped = useMemo(() => {
  //   return {
  //     squat: lifts.filter((l) => l.type === "squat"),
  //     bench: lifts.filter((l) => l.type === "bench"),
  //     deadlift: lifts.filter((l) => l.type === "deadlift"),
  //   };
  // }, [lifts]);


      const grouped = useMemo(() => {
      const sortByWeight = (arr: LiftDoc[]) =>
        [...arr].sort((a, b) => b.weightKg - a.weightKg);

      return {
        squat: sortByWeight(lifts.filter((l) => l.type === "squat")),
        bench: sortByWeight(lifts.filter((l) => l.type === "bench")),
        deadlift: sortByWeight(lifts.filter((l) => l.type === "deadlift")),
      };
    }, [lifts]);








  const startEdit = (lift: LiftDoc) => {
    setEditingId(lift.id);
    setEditWeight(String(lift.weightKg));
    setEditReps(String(lift.reps));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeight("");
    setEditReps("");
  };

  const sanitizeWeight = (s: string) => s.replace(/[^0-9.]/g, "");
  const sanitizeReps = (s: string) => s.replace(/[^\d]/g, "");

  const saveEdit = async (liftId: string) => {
    const w = Number(editWeight);
    const r = Number(editReps);

    if (!editWeight || !editReps) {
      showAlert("Missing details", "Weight and reps are required.");
      return;
    }

    try {
      await updateDoc(doc(db, "lifts", liftId), {
        weightKg: w,
        reps: r,
      });
      cancelEdit();
    } catch (e) {
      console.error(e);
      showAlert("Update failed", "Could not update the lift.");
    }
  };

  const deleteLift = async (liftId: string) => {
    const ok =
      Platform.OS === "web"
        ? window.confirm("Delete this lift?")
        : true;

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "lifts", liftId));
    } catch (e) {
      console.error(e);
      showAlert("Delete failed", "Could not delete the lift.");
    }
  };

  const renderSection = (title: string, items: LiftDoc[]) => (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {dataLoading ? (
        <Text style={styles.muted}>Loading…</Text>
      ) : items.length === 0 ? (
        <Text style={styles.muted}>No lifts logged</Text>
      ) : (
        items.map((lift) => (
          <View key={lift.id} style={styles.rowItem}>
            {editingId === lift.id ? (
              <View style={styles.editRow}>
                <TextInput
                  value={editWeight}
                  onChangeText={(t) => setEditWeight(sanitizeWeight(t))}
                  placeholder="kg"
                  placeholderTextColor="#777"
                  keyboardType="numeric"
                  style={[styles.input, styles.editInput]}
                />
                <TextInput
                  value={editReps}
                  onChangeText={(t) => setEditReps(sanitizeReps(t))}
                  placeholder="reps"
                  placeholderTextColor="#777"
                  keyboardType="numeric"
                  style={[styles.input, styles.editInput]}
                />

                <Pressable style={styles.smallBtn} onPress={() => saveEdit(lift.id)}>
                  <Text style={styles.smallBtnText}>Save</Text>
                </Pressable>
                <Pressable
                  style={[styles.smallBtn, styles.smallBtnDark]}
                  onPress={cancelEdit}
                >
                  <Text style={styles.smallBtnText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.displayRow}>
                <Text style={styles.liftLine}>
                  {lift.weightKg} kg × {lift.reps}
                </Text>

                <View style={styles.actions}>
                  <Pressable style={styles.smallBtn} onPress={() => startEdit(lift)}>
                    <Text style={styles.smallBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallBtn, styles.smallBtnDanger]}
                    onPress={() => deleteLift(lift.id)}
                  >
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  // ⛔ Block render until auth resolved
  if (loading || !user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>My Lifts</Text>

      {renderSection("Squat", grouped.squat)}
      {renderSection("Bench Press", grouped.bench)}
      {renderSection("Deadlift", grouped.deadlift)}

      {/* <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable> */}

      <Pressable onPress={() => router.replace("/mainMenu")}>
      <Text style={styles.back}>← Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1c1c1c",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  muted: { color: "#aaa" },

  rowItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#2a2a2a" },
  displayRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  liftLine: { color: "#fff", fontSize: 15 },

  actions: { flexDirection: "row", gap: 8 },
  smallBtn: {
    backgroundColor: "#e10600",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  smallBtnDark: { backgroundColor: "#333" },
  smallBtnDanger: { backgroundColor: "#7a0000" },
  smallBtnText: { color: "#fff", fontWeight: "600" },

  editRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  editInput: { width: 110 },

  back: { color: "#aaa", textAlign: "center", marginTop: 10 },
});
