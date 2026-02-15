// import { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Pressable,
//   Alert,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { db } from "../firebase/firebase";
// import {
//   collection,
//   getDocs,
//   limit,
//   orderBy,
//   query,
//   where,
// } from "firebase/firestore";
// import { useAuthReady } from "../hooks/useAuthReady";

// type LiftType = "squat" | "bench" | "deadlift";
// type Sex = "M" | "F";
// type Equipment = "raw" | "equipped";

// type RecordDoc = {
//   federation: string;
//   sex: Sex;
//   equipment: Equipment;
//   tested: boolean;
//   weightClass: string;

//   squatRecordKg: number;
//   benchRecordKg: number;
//   deadliftRecordKg: number;
//   totalRecordKg: number;

//   totals?: number[]; // optional (top totals list)
// };

// const WEIGHT_CLASSES_M = ["-59","-66","-74","-83","-93","-105","-120","120+"];
// const WEIGHT_CLASSES_F = ["-47","-52","-57","-63","-69","-76","-84","84+"];

// export default function Compare() {
//   const router = useRouter();
//   const { user, loading } = useAuthReady();

//   // Filters
//   const [sex, setSex] = useState<Sex>("M");
//   const [equipment, setEquipment] = useState<Equipment>("raw");
//   const [tested, setTested] = useState(true);
//   const [federation, setFederation] = useState("IPF");
//   const [weightClass, setWeightClass] = useState("-83");

//   // User PRs
//   const [pr, setPr] = useState<{ squat: number; bench: number; deadlift: number }>({
//     squat: 0,
//     bench: 0,
//     deadlift: 0,
//   });

//   // Record
//   const [record, setRecord] = useState<RecordDoc | null>(null);
//   const [busy, setBusy] = useState(false);

//   const showAlert = (title: string, message: string) => {
//     if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
//     else Alert.alert(title, message);
//   };

//   // Keep weight classes list correct for sex
//   useEffect(() => {
//     const list = sex === "M" ? WEIGHT_CLASSES_M : WEIGHT_CLASSES_F;
//     if (!list.includes(weightClass)) setWeightClass(list[0]);
//   }, [sex]);

//   // Auth guard
//   useEffect(() => {
//     if (!loading && !user) router.replace("/login");
//   }, [loading, user]);

//   // 1) Load user PRs (best 1-rep only) from your existing lifts collection
//   useEffect(() => {
//     if (loading || !user) return;

//     const loadPR = async () => {
//       try {
//         setBusy(true);

//         const best: any = { squat: 0, bench: 0, deadlift: 0 };

//         // for each lift type, get heaviest rep=1
//         const types: LiftType[] = ["squat", "bench", "deadlift"];
//         for (const t of types) {
//           const q = query(
//             collection(db, "lifts"),
//             where("userId", "==", user.uid),
//             where("type", "==", t),
//             where("reps", "==", 1),
//             orderBy("weightKg", "desc"),
//             limit(1)
//           );
//           const snap = await getDocs(q);
//           if (!snap.empty) {
//             const data: any = snap.docs[0].data();
//             best[t] = Number(data.weightKg ?? 0);
//           }
//         }

//         setPr(best);
//       } catch (e) {
//         console.error(e);
//         showAlert("PR load failed", "Could not load your PRs. Check indexes if Firestore asks.");
//       } finally {
//         setBusy(false);
//       }
//     };

//     loadPR();
//   }, [loading, user]);

//   // 2) Load the matching record doc from Firestore `records`
//   useEffect(() => {
//     if (loading || !user) return;

//     const loadRecord = async () => {
//       try {
//         setBusy(true);

//         const q = query(
//           collection(db, "records"),
//           where("federation", "==", federation),
//           where("sex", "==", sex),
//           where("equipment", "==", equipment),
//           where("tested", "==", tested),
//           where("weightClass", "==", weightClass),
//           limit(1)
//         );

//         const snap = await getDocs(q);
//         if (snap.empty) {
//           setRecord(null);
//           return;
//         }

//         setRecord(snap.docs[0].data() as RecordDoc);
//       } catch (e) {
//         console.error(e);
//         showAlert(
//           "Records load failed",
//           "Could not load records. Make sure you created a matching document in `records`."
//         );
//       } finally {
//         setBusy(false);
//       }
//     };

//     loadRecord();
//   }, [loading, user, federation, sex, equipment, tested, weightClass]);

//   const totalPR = useMemo(() => pr.squat + pr.bench + pr.deadlift, [pr]);

//   const comparisons = useMemo(() => {
//     if (!record) return null;

//     const pct = (mine: number, rec: number) => (rec > 0 ? (mine / rec) * 100 : 0);

//     const squatPct = pct(pr.squat, record.squatRecordKg);
//     const benchPct = pct(pr.bench, record.benchRecordKg);
//     const deadPct = pct(pr.deadlift, record.deadliftRecordKg);
//     const totalPct = pct(totalPR, record.totalRecordKg);

//     // OPTIONAL “placing” if record.totals exists
//     let placingText: string | null = null;
//     if (record.totals && record.totals.length > 0) {
//       const totals = [...record.totals].sort((a, b) => b - a);
//       const rank = totals.findIndex((t) => totalPR >= t) + 1; // 1-based
//       placingText = rank > 0 ? `Estimated placing: #${rank} (vs top ${totals.length})` : `Below top ${totals.length}`;
//     }

//     return {
//       squatPct,
//       benchPct,
//       deadPct,
//       totalPct,
//       placingText,
//     };
//   }, [record, pr, totalPR]);

//   const pill = (label: string, active: boolean, onPress: () => void) => (
//     <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
//       <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
//     </Pressable>
//   );

//   const weightClassOptions = sex === "M" ? WEIGHT_CLASSES_M : WEIGHT_CLASSES_F;

//   if (loading || !user) return null;

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       <Text style={styles.title}>Compare vs Records</Text>
//       <Text style={styles.subtitle}>
//         Pick a division, then we’ll compare your best 1RM lifts and total against the record.
//       </Text>

//       {/* Filters */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Division Filters</Text>

//         <Text style={styles.label}>Sex</Text>
//         <View style={styles.row}>
//           {pill("Men", sex === "M", () => setSex("M"))}
//           {pill("Women", sex === "F", () => setSex("F"))}
//         </View>

//         <Text style={styles.label}>Equipment</Text>
//         <View style={styles.row}>
//           {pill("Raw", equipment === "raw", () => setEquipment("raw"))}
//           {pill("Equipped", equipment === "equipped", () => setEquipment("equipped"))}
//         </View>

//         <Text style={styles.label}>Tested</Text>
//         <View style={styles.row}>
//           {pill("Tested", tested === true, () => setTested(true))}
//           {pill("Untested", tested === false, () => setTested(false))}
//         </View>

//         <Text style={styles.label}>Federation</Text>
//         <View style={styles.row}>
//           {pill("IPF", federation === "IPF", () => setFederation("IPF"))}
//           {pill("WRPF", federation === "WRPF", () => setFederation("WRPF"))}
//           {pill("USAPL", federation === "USAPL", () => setFederation("USAPL"))}
//         </View>
//         <Text style={styles.hint}>Add more federations later by adding docs in `records`.</Text>

//         <Text style={styles.label}>Weight Class</Text>
//         <View style={[styles.row, { flexWrap: "wrap" }]}>
//           {weightClassOptions.map((wc) => pill(wc, weightClass === wc, () => setWeightClass(wc)))}
//         </View>
//       </View>

//       {/* User PRs */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Your Current PRs (1RM)</Text>

//         <View style={styles.kvRow}>
//           <Text style={styles.k}>Squat</Text>
//           <Text style={styles.v}>{pr.squat ? `${pr.squat} kg` : "—"}</Text>
//         </View>
//         <View style={styles.kvRow}>
//           <Text style={styles.k}>Bench</Text>
//           <Text style={styles.v}>{pr.bench ? `${pr.bench} kg` : "—"}</Text>
//         </View>
//         <View style={styles.kvRow}>
//           <Text style={styles.k}>Deadlift</Text>
//           <Text style={styles.v}>{pr.deadlift ? `${pr.deadlift} kg` : "—"}</Text>
//         </View>

//         <View style={[styles.kvRow, { marginTop: 10 }]}>
//           <Text style={[styles.k, { fontWeight: "800" }]}>Total</Text>
//           <Text style={[styles.v, { fontWeight: "800" }]}>{totalPR ? `${totalPR} kg` : "—"}</Text>
//         </View>

//         <Text style={styles.hint}>
//           Tip: Your PRs are read from your heaviest **reps = 1** lifts in the `lifts` collection.
//         </Text>
//       </View>

//       {/* Results */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Comparison</Text>

//         {busy ? (
//           <Text style={styles.muted}>Loading…</Text>
//         ) : !record ? (
//           <Text style={styles.muted}>
//             No record document found for this division. Create one in Firestore:
//             {"\n"}records → add document matching these filters.
//           </Text>
//         ) : !comparisons ? (
//           <Text style={styles.muted}>No data.</Text>
//         ) : (
//           <>
//             <View style={styles.compareRow}>
//               <Text style={styles.compareTitle}>Squat</Text>
//               <Text style={styles.compareText}>
//                 {pr.squat || 0} / {record.squatRecordKg} kg{" "}
//                 <Text style={styles.red}>({comparisons.squatPct.toFixed(1)}%)</Text>
//               </Text>
//             </View>

//             <View style={styles.compareRow}>
//               <Text style={styles.compareTitle}>Bench</Text>
//               <Text style={styles.compareText}>
//                 {pr.bench || 0} / {record.benchRecordKg} kg{" "}
//                 <Text style={styles.red}>({comparisons.benchPct.toFixed(1)}%)</Text>
//               </Text>
//             </View>

//             <View style={styles.compareRow}>
//               <Text style={styles.compareTitle}>Deadlift</Text>
//               <Text style={styles.compareText}>
//                 {pr.deadlift || 0} / {record.deadliftRecordKg} kg{" "}
//                 <Text style={styles.red}>({comparisons.deadPct.toFixed(1)}%)</Text>
//               </Text>
//             </View>

//             <View style={[styles.compareRow, { marginTop: 10 }]}>
//               <Text style={[styles.compareTitle, { fontWeight: "800" }]}>Total</Text>
//               <Text style={[styles.compareText, { fontWeight: "800" }]}>
//                 {totalPR || 0} / {record.totalRecordKg} kg{" "}
//                 <Text style={styles.red}>({comparisons.totalPct.toFixed(1)}%)</Text>
//               </Text>
//             </View>

//             {comparisons.placingText ? (
//               <Text style={styles.placing}>{comparisons.placingText}</Text>
//             ) : (
//               <Text style={styles.hint}>
//                 Want “placing”? Add a `totals: []` array (top totals for this division) into your
//                 record doc.
//               </Text>
//             )}
//           </>
//         )}
//       </View>

//       <Pressable style={styles.backBtn} onPress={() => router.replace("/mainMenu")}>
//         <Text style={styles.backBtnText}>Back to Main Menu</Text>
//       </Pressable>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#111", padding: 24 },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   subtitle: { color: "#aaa", textAlign: "center", marginBottom: 18 },

//   card: {
//     backgroundColor: "#1c1c1c",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   sectionTitle: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 10 },
//   label: { color: "#aaa", marginTop: 12, marginBottom: 6 },

//   row: { flexDirection: "row", gap: 10 },
//   pill: {
//     backgroundColor: "#111",
//     borderWidth: 1,
//     borderColor: "#333",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 999,
//     marginBottom: 8,
//   },
//   pillActive: { backgroundColor: "#e10600", borderColor: "#e10600" },
//   pillText: { color: "#aaa", fontWeight: "700" },
//   pillTextActive: { color: "#fff" },

//   kvRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
//   k: { color: "#aaa" },
//   v: { color: "#fff" },

//   compareRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#2a2a2a" },
//   compareTitle: { color: "#fff", fontWeight: "700" },
//   compareText: { color: "#ccc", marginTop: 4 },
//   red: { color: "#e10600", fontWeight: "800" },

//   placing: { color: "#fff", marginTop: 12, fontWeight: "800" },
//   muted: { color: "#aaa" },
//   hint: { color: "#888", marginTop: 10 },

//   backBtn: {
//     backgroundColor: "#e10600",
//     paddingVertical: 16,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 6,
//   },
//   backBtnText: { color: "#fff", fontWeight: "800" },
// });


