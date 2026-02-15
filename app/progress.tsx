// // import { useEffect, useMemo, useState } from "react";
// // import { View, Text, StyleSheet, ScrollView } from "react-native";
// // import { useAuthReady } from "../hooks/useAuthReady";
// // import { db } from "../firebase/firebase";
// // import {
// //   collection,
// //   onSnapshot,
// //   orderBy,
// //   query,
// //   where,
// // } from "firebase/firestore";
// // import { LineChart } from "react-native-chart-kit";
// // import { Dimensions } from "react-native";

// // type LiftDoc = {
// //   weightKg: number;
// //   reps: number;
// //   createdAt?: any;
// // };

// // export default function Progress() {
// //   const { user, loading } = useAuthReady();
// //   const [lifts, setLifts] = useState<LiftDoc[]>([]);

// //   useEffect(() => {
// //     if (loading || !user) return;

// //     const q = query(
// //       collection(db, "lifts"),
// //       where("userId", "==", user.uid),
// //       orderBy("createdAt", "asc")
// //     );

// //     const unsub = onSnapshot(q, (snap) => {
// //       const rows: LiftDoc[] = snap.docs.map((d) => d.data() as LiftDoc);
// //       setLifts(rows);
// //     });

// //     return () => unsub();
// //   }, [loading, user]);

// //   // 🔥 ONLY 1 REP MAX LIFTS
// //   const oneRepLifts = useMemo(() => {
// //     return lifts
// //       .filter((l) => l.reps === 1)
// //       .sort(
// //         (a, b) =>
// //           a.createdAt?.seconds - b.createdAt?.seconds
// //       );
// //   }, [lifts]);

// //   const chartData = useMemo(() => {
// //     if (oneRepLifts.length === 0) {
// //       return null;
// //     }

// //     return {
// //       labels: oneRepLifts.map((l) => {
// //         const date = new Date(l.createdAt.seconds * 1000);
// //         return `${date.getDate()}/${date.getMonth() + 1}`;
// //       }),
// //       datasets: [
// //         {
// //           data: oneRepLifts.map((l) => l.weightKg),
// //         },
// //       ],
// //     };
// //   }, [oneRepLifts]);

// //   if (loading || !user) return null;

// //   return (
// //     <ScrollView style={styles.container}>
// //       <Text style={styles.title}>Progress (1 Rep Max)</Text>

// //       {chartData ? (
// //         <LineChart
// //           data={chartData}
// //           width={Dimensions.get("window").width - 40}
// //           height={220}
// //           chartConfig={{
// //             backgroundColor: "#111",
// //             backgroundGradientFrom: "#111",
// //             backgroundGradientTo: "#111",
// //             decimalPlaces: 1,
// //             color: () => "#e10600",
// //             labelColor: () => "#aaa",
// //           }}
// //           bezier
// //           style={{ borderRadius: 10 }}
// //         />
// //       ) : (
// //         <Text style={styles.noData}>
// //           No 1-rep lifts logged yet.
// //         </Text>
// //       )}

// //       <Text style={styles.info}>
// //         Only lifts with 1 rep are tracked here.
// //         Log new PRs as 1 rep in Enter Lifts.
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#111",
// //     padding: 20,
// //   },
// //   title: {
// //     fontSize: 24,
// //     fontWeight: "bold",
// //     color: "#fff",
// //     textAlign: "center",
// //     marginBottom: 20,
// //   },
// //   noData: {
// //     color: "#aaa",
// //     textAlign: "center",
// //     marginTop: 40,
// //   },
// //   info: {
// //     color: "#aaa",
// //     textAlign: "center",
// //     marginTop: 20,
// //   },
// // });





// import { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Pressable,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useAuthReady } from "../hooks/useAuthReady";
// import { db } from "../firebase/firebase";
// import {
//   collection,
//   onSnapshot,
//   orderBy,
//   query,
//   where,
// } from "firebase/firestore";
// import { LineChart } from "react-native-chart-kit";

// type LiftDoc = {
//   type: "squat" | "bench" | "deadlift";
//   weightKg: number;
//   reps: number;
//   createdAt?: any;
// };

// export default function Progress() {
//   const router = useRouter();
//   const { user, loading } = useAuthReady();
//   const [lifts, setLifts] = useState<LiftDoc[]>([]);

//   const screenWidth = Dimensions.get("window").width;

//   useEffect(() => {
//     if (loading || !user) return;

//     const q = query(
//       collection(db, "lifts"),
//       where("userId", "==", user.uid),
//       orderBy("createdAt", "asc")
//     );

//     const unsub = onSnapshot(q, (snap) => {
//       const rows: LiftDoc[] = snap.docs.map((d) => d.data() as LiftDoc);
//       setLifts(rows);
//     });

//     return () => unsub();
//   }, [loading, user]);

//   // 🔥 Filter 1 rep only
//   const filterLift = (type: "squat" | "bench" | "deadlift") =>
//     lifts
//       .filter(
//         (l) =>
//           l.type === type &&
//           l.reps === 1 &&
//           l.createdAt
//       )
//       .sort(
//         (a, b) =>
//           a.createdAt.seconds - b.createdAt.seconds
//       );

//   const squatData = filterLift("squat");
//   const benchData = filterLift("bench");
//   const deadliftData = filterLift("deadlift");

//   const buildChart = (data: LiftDoc[]) => {
//     if (data.length === 0) return null;

//     return {
//       labels: data.map((l) => {
//         const date = new Date(l.createdAt.seconds * 1000);
//         return `${date.getDate()}/${date.getMonth() + 1}`;
//       }),
//       datasets: [
//         {
//           data: data.map((l) => l.weightKg),
//           strokeWidth: 3,
//         },
//       ],
//     };
//   };

//   const renderChart = (title: string, data: LiftDoc[]) => {
//     const chart = buildChart(data);
//     if (!chart) return null;

//     return (
//       <View style={styles.chartCard}>
//         <Text style={styles.chartTitle}>{title}</Text>
//         <LineChart
//           data={chart}
//           width={screenWidth - 40}
//           height={260}
//           yAxisSuffix="kg"
//           chartConfig={{
//             backgroundColor: "#1c1c1c",
//             backgroundGradientFrom: "#1c1c1c",
//             backgroundGradientTo: "#1c1c1c",
//             decimalPlaces: 1,
//             color: () => "#e10600",
//             labelColor: () => "#aaa",
//             propsForDots: {
//               r: "5",
//               strokeWidth: "2",
//               stroke: "#e10600",
//             },
//           }}
//           bezier
//           style={{ borderRadius: 12 }}
//         />
//       </View>
//     );
//   };

//   if (loading || !user) return null;

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ paddingBottom: 40 }}
//     >
//       <Text style={styles.title}>Strength Progress (1RM)</Text>

//       {renderChart("Squat 1RM", squatData)}
//       {renderChart("Bench Press 1RM", benchData)}
//       {renderChart("Deadlift 1RM", deadliftData)}

//       {!squatData.length &&
//         !benchData.length &&
//         !deadliftData.length && (
//           <Text style={styles.noData}>
//             No 1-rep max lifts logged yet.
//           </Text>
//         )}

//       <Pressable
//         style={styles.backButton}
//         onPress={() => router.replace("/mainMenu")}
//       >
//         <Text style={styles.backText}>Back to Main Menu</Text>
//       </Pressable>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#111",
//     padding: 20,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   chartCard: {
//     backgroundColor: "#1c1c1c",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   chartTitle: {
//     color: "#fff",
//     fontWeight: "bold",
//     marginBottom: 10,
//     fontSize: 18,
//   },
//   noData: {
//     color: "#aaa",
//     textAlign: "center",
//     marginTop: 40,
//   },
//   backButton: {
//     backgroundColor: "#e10600",
//     padding: 16,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   backText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });





import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { useAuthReady } from "../hooks/useAuthReady";
import { db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

type LiftType = "squat" | "bench" | "deadlift";

type OneRMDoc = {
  id: string;
  type: LiftType;
  weightKg: number;
  createdAt?: any;
};

const screenW = Dimensions.get("window").width;

export default function Progress() {
  const router = useRouter();
  const { user, loading } = useAuthReady();

  const [liftType, setLiftType] = useState<LiftType>("squat");
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<OneRMDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const sanitizeWeight = (s: string) => s.replace(/[^0-9.]/g, "");

  // ✅ Auth redirect safely after loading
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // ✅ Live-load ALL 1RM progress docs for this user (no index needed)
  useEffect(() => {
    if (loading || !user) return;

    setDataLoading(true);

    // We store progress entries here:
    // users/{uid}/oneRepMax
    const ref = collection(db, "users", user.uid, "oneRepMax");
    const q = query(ref, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: OneRMDoc[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            type: data.type as LiftType,
            weightKg: Number(data.weightKg ?? 0),
            createdAt: data.createdAt,
          };
        });
        setRows(list);
        setDataLoading(false);
      },
      (err) => {
        console.error(err);
        setDataLoading(false);
        showAlert("Load failed", "Could not load progress entries.");
      }
    );

    return () => unsub();
  }, [loading, user]);

  const validateWeight = (wStr: string) => {
    if (!wStr) return { ok: false, msg: "Enter a weight." };

    const w = Number(wStr);
    // nearest decimal place allowed, e.g. 122.5
    if (!/^\d{1,3}(\.\d{1,1})?$/.test(wStr) || Number.isNaN(w)) {
      return { ok: false, msg: "Weight must be like 120 or 120.5 (1 decimal)." };
    }
    if (w < 20 || w > 500) return { ok: false, msg: "Weight looks unrealistic." };

    return { ok: true, msg: "" };
  };

  const canSave = useMemo(() => {
    return validateWeight(weight).ok && !saving && !!user && !loading;
  }, [weight, saving, user, loading]);

  const handleAdd = async () => {
    if (!user) return;

    const v = validateWeight(weight);
    if (!v.ok) {
      showAlert("Fix required", v.msg);
      return;
    }

    try {
      setSaving(true);

      // ✅ always 1-rep max entry (we do NOT store reps here at all)
      await addDoc(collection(db, "users", user.uid, "oneRepMax"), {
        type: liftType,
        weightKg: Number(weight),
        createdAt: serverTimestamp(),
      });

      setWeight("");
      showAlert("Saved ✅", "1RM entry added to your progress graph.");
    } catch (e) {
      console.error(e);
      showAlert("Save failed", "Could not save your 1RM entry.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: OneRMDoc) => {
    setEditingId(item.id);
    setEditWeight(String(item.weightKg));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeight("");
  };

  const saveEdit = async (id: string) => {
    if (!user) return;

    const v = validateWeight(editWeight);
    if (!v.ok) {
      showAlert("Fix required", v.msg);
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "oneRepMax", id), {
        weightKg: Number(editWeight),
        // NOTE: we keep createdAt unchanged so history stays tied to original date
      });

      cancelEdit();
      showAlert("Saved ✅", "Entry updated.");
    } catch (e) {
      console.error(e);
      showAlert("Update failed", "Could not update this entry.");
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;

    const ok =
      Platform.OS === "web" ? window.confirm("Delete this progress entry?") : true;

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "oneRepMax", id));
      showAlert("Deleted ✅", "Entry removed.");
    } catch (e) {
      console.error(e);
      showAlert("Delete failed", "Could not delete this entry.");
    }
  };

  const formatLabel = (ts: any) => {
    if (!ts?.seconds) return "";
    const d = new Date(ts.seconds * 1000);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    // show day/month (simple & readable)
    return `${dd}/${mm}`;
  };

  const group = useMemo(() => {
    return {
      squat: rows.filter((r) => r.type === "squat"),
      bench: rows.filter((r) => r.type === "bench"),
      deadlift: rows.filter((r) => r.type === "deadlift"),
    };
  }, [rows]);

  const buildChart = (items: OneRMDoc[]) => {
    if (items.length === 0) return null;

    const labels = items.map((i) => formatLabel(i.createdAt));
    const data = items.map((i) => i.weightKg);

    // Chart-kit looks weird with only 1 point. Duplicate the point to draw a line.
    if (data.length === 1) {
      return {
        labels: [labels[0], ""],
        datasets: [{ data: [data[0], data[0]] }],
      };
    }

    // Too many labels gets messy. Show only every Nth label.
    const MAX_LABELS = 8;
    const step = Math.ceil(labels.length / MAX_LABELS);

    const prettyLabels = labels.map((lab, idx) => (idx % step === 0 ? lab : ""));

    return {
      labels: prettyLabels,
      datasets: [{ data }],
    };
  };

  const Card = ({
    title,
    items,
  }: {
    title: string;
    items: OneRMDoc[];
  }) => {
    const chartData = buildChart(items);

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {dataLoading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : items.length === 0 ? (
          <Text style={styles.muted}>No 1RM entries yet</Text>
        ) : (
          <>
            {chartData && (
              <View style={styles.chartWrap}>
                <LineChart
                  data={chartData}
                  width={screenW - 48}
                  height={260}
                  withInnerLines
                  withOuterLines={false}
                  withDots
                  bezier
                  fromZero={false}
                  chartConfig={{
                    backgroundColor: "#1c1c1c",
                    backgroundGradientFrom: "#1c1c1c",
                    backgroundGradientTo: "#1c1c1c",
                    decimalPlaces: 1,
                    color: () => "#e10600",
                    labelColor: () => "#aaa",
                    propsForBackgroundLines: {
                      strokeDasharray: "4 6",
                      stroke: "#333",
                    },
                  }}
                  style={{ borderRadius: 12 }}
                />
              </View>
            )}

            <Text style={styles.subInfo}>
              Latest:{" "}
              <Text style={styles.bold}>
                {items[items.length - 1]?.weightKg} kg
              </Text>{" "}
              ({formatLabel(items[items.length - 1]?.createdAt)})
            </Text>

            <View style={styles.listWrap}>
              {items
                .slice()
                .reverse()
                .map((it) => (
                  <View key={it.id} style={styles.listRow}>
                    {editingId === it.id ? (
                      <>
                        <Text style={styles.listText}>
                          {formatLabel(it.createdAt)} •{" "}
                        </Text>
                        <TextInput
                          value={editWeight}
                          onChangeText={(t) => setEditWeight(sanitizeWeight(t))}
                          placeholder="kg"
                          placeholderTextColor="#777"
                          keyboardType="numeric"
                          style={[styles.input, { width: 120 }]}
                        />
                        <Pressable
                          style={styles.smallBtn}
                          onPress={() => saveEdit(it.id)}
                        >
                          <Text style={styles.smallBtnText}>Save</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.smallBtn, styles.smallBtnDark]}
                          onPress={cancelEdit}
                        >
                          <Text style={styles.smallBtnText}>Cancel</Text>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Text style={styles.listText}>
                          {formatLabel(it.createdAt)} •{" "}
                          <Text style={styles.bold}>{it.weightKg} kg</Text>
                        </Text>
                        <View style={styles.actions}>
                          <Pressable
                            style={styles.smallBtn}
                            onPress={() => startEdit(it)}
                          >
                            <Text style={styles.smallBtnText}>Edit</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.smallBtn, styles.smallBtnDanger]}
                            onPress={() => deleteEntry(it.id)}
                          >
                            <Text style={styles.smallBtnText}>Delete</Text>
                          </Pressable>
                        </View>
                      </>
                    )}
                  </View>
                ))}
            </View>
          </>
        )}
      </View>
    );
  };

  if (loading || !user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Strength Progress (1RM)</Text>
      <Text style={styles.subtitle}>
        Add ONLY your 1-rep max. Every entry creates a new point on the graph.
      </Text>

      {/* ADD FORM */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add 1RM Entry</Text>

        <Text style={styles.label}>Lift Type</Text>
        <View style={styles.row}>
          {(["squat", "bench", "deadlift"] as const).map((t) => (
            <Pressable
              key={t}
              style={[styles.typeButton, liftType === t && styles.typeButtonActive]}
              onPress={() => setLiftType(t)}
            >
              <Text style={[styles.typeText, liftType === t && styles.typeTextActive]}>
                {t.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={(t) => setWeight(sanitizeWeight(t))}
          placeholder="e.g. 140 or 140.5"
          placeholderTextColor="#777"
          keyboardType="numeric"
          style={styles.input}
        />

        <Pressable
          style={[styles.bigBtn, (!canSave || saving) && styles.bigBtnDisabled]}
          onPress={handleAdd}
          disabled={!canSave || saving}
        >
          <Text style={styles.bigBtnText}>{saving ? "Saving..." : "Save 1RM"}</Text>
        </Pressable>

        <Text style={styles.help}>
          Tip: Don’t “edit” old PRs unless you made a mistake. Add new PRs as new entries so the
          graph shows real progress over time.
        </Text>
      </View>

      {/* THREE GRAPHS */}
      <Card title="Squat 1RM" items={group.squat} />
      <Card title="Bench Press 1RM" items={group.bench} />
      <Card title="Deadlift 1RM" items={group.deadlift} />

      {/* BACK */}
      <Pressable
        style={styles.backBtn}
        onPress={() => router.replace("/mainMenu")}
      >
        <Text style={styles.backBtnText}>Back to Main Menu</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 24 },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
  },

  formCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: { color: "#fff", fontWeight: "800", fontSize: 18, marginBottom: 12 },
  label: { color: "#aaa", marginTop: 10, marginBottom: 6 },

  row: { flexDirection: "row", gap: 10, marginBottom: 12 },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  typeButtonActive: { backgroundColor: "#e10600", borderColor: "#e10600" },
  typeText: { color: "#aaa", fontWeight: "700" },
  typeTextActive: { color: "#fff" },

  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },

  bigBtn: {
    marginTop: 14,
    backgroundColor: "#e10600",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  bigBtnDisabled: { opacity: 0.5 },
  bigBtnText: { color: "#fff", fontWeight: "800" },

  help: { color: "#888", marginTop: 12, lineHeight: 18 },

  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 10 },
  muted: { color: "#aaa" },

  chartWrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },

  subInfo: { color: "#aaa", marginBottom: 10 },
  bold: { color: "#fff", fontWeight: "800" },

  listWrap: { marginTop: 6, borderTopWidth: 1, borderTopColor: "#2a2a2a" },
  listRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  listText: { color: "#ccc" },

  actions: { flexDirection: "row", gap: 8 },
  smallBtn: {
    backgroundColor: "#e10600",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  smallBtnDark: { backgroundColor: "#333" },
  smallBtnDanger: { backgroundColor: "#7a0000" },
  smallBtnText: { color: "#fff", fontWeight: "800" },

  backBtn: {
    marginTop: 10,
    backgroundColor: "#e10600",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontWeight: "800" },
});
