import { useRouter } from "expo-router";
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
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { db } from "../firebase/firebase";
import { useAuthReady } from "../hooks/useAuthReady";

type OtherLift = {
  id: string;
  name: string;
  createdAt?: any;
};

type LiftSet = {
  id: string;
  weightKg: number;
  reps: number;
  createdAt?: any;
};

export default function OtherLifts() {
  const router = useRouter();
  const { user, loading } = useAuthReady();

  // Add exercise
  const [newName, setNewName] = useState("");
  const [savingLift, setSavingLift] = useState(false);

  // All exercises
  const [lifts, setLifts] = useState<OtherLift[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Expand/collapse a lift to show sets
  const [openLiftId, setOpenLiftId] = useState<string | null>(null);

  // Sets for currently opened lift
  const [sets, setSets] = useState<LiftSet[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);

  // Add set inputs (for current open lift)
  const [setWeight, setSetWeight] = useState("");
  const [setReps, setSetReps] = useState("");
  const [savingSet, setSavingSet] = useState(false);

  // Edit lift name
  const [editingLiftId, setEditingLiftId] = useState<string | null>(null);
  const [editLiftName, setEditLiftName] = useState("");

  // Edit set
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editSetWeight, setEditSetWeight] = useState("");
  const [editSetReps, setEditSetReps] = useState("");

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  const sanitizeName = (s: string) => s.replace(/\s+/g, " ").trimStart();
  const sanitizeNumber = (s: string) => s.replace(/[^0-9.]/g, "");
  const sanitizeInt = (s: string) => s.replace(/[^0-9]/g, "");

  // Auth redirect
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Load all other lifts
  useEffect(() => {
    if (loading || !user) return;

    setDataLoading(true);
    const ref = collection(db, "users", user.uid, "otherLifts");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: OtherLift[] = snap.docs.map((d) => {
          const data: any = d.data();
          return { id: d.id, name: String(data.name ?? ""), createdAt: data.createdAt };
        });
        setLifts(list);
        setDataLoading(false);
      },
      (err) => {
        console.error(err);
        setDataLoading(false);
        showAlert("Load failed", "Could not load your other lifts.");
      }
    );

    return () => unsub();
  }, [loading, user]);

  // Load sets for open lift (sorted by weight high->low; tie-break by createdAt)
  useEffect(() => {
    if (loading || !user) return;
    if (!openLiftId) {
      setSets([]);
      return;
    }

    setSetsLoading(true);

    const ref = collection(db, "users", user.uid, "otherLifts", openLiftId, "sets");
    // sort by weight (biggest first)
    const q = query( ref, orderBy("weightKg", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: LiftSet[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            weightKg: Number(data.weightKg ?? 0),
            reps: Number(data.reps ?? 0),
            createdAt: data.createdAt,
          };
        });
        setSets(list);
        setSetsLoading(false);
      },
      (err) => {
        console.error(err);
        setSetsLoading(false);
        showAlert("Load failed", "Could not load sets for this lift.");
      }
    );

    return () => unsub();
  }, [loading, user, openLiftId]);

  const validateLiftName = (name: string) => {
    const clean = name.trim();
    if (clean.length < 2) return { ok: false, msg: "Exercise name too short." };
    if (clean.length > 30) return { ok: false, msg: "Keep it under 30 characters." };
    return { ok: true, msg: "" };
  };

  const validateSet = (w: string, r: string) => {
    const weight = Number(w);
    const reps = Number(r);

    if (!w || Number.isNaN(weight)) return { ok: false, msg: "Enter weight." };
    if (weight < 0 || weight > 500) return { ok: false, msg: "Weight looks unrealistic." };

    if (!r || Number.isNaN(reps)) return { ok: false, msg: "Enter reps." };
    if (reps < 1 || reps > 100) return { ok: false, msg: "Reps looks unrealistic." };

    return { ok: true, msg: "" };
  };

  const addLift = async () => {
    if (!user) return;

    const clean = newName.trim();
    const v = validateLiftName(clean);
    if (!v.ok) return showAlert("Fix required", v.msg);

    try {
      setSavingLift(true);
      await addDoc(collection(db, "users", user.uid, "otherLifts"), {
        name: clean,
        createdAt: serverTimestamp(),
      });
      setNewName("");
    } catch (e) {
      console.error(e);
      showAlert("Save failed", "Could not add exercise.");
    } finally {
      setSavingLift(false);
    }
  };

  const startEditLift = (lift: OtherLift) => {
    setEditingLiftId(lift.id);
    setEditLiftName(lift.name);
  };

  const cancelEditLift = () => {
    setEditingLiftId(null);
    setEditLiftName("");
  };

  const saveEditLift = async (liftId: string) => {
    if (!user) return;

    const clean = editLiftName.trim();
    const v = validateLiftName(clean);
    if (!v.ok) return showAlert("Fix required", v.msg);

    try {
      await updateDoc(doc(db, "users", user.uid, "otherLifts", liftId), {
        name: clean,
      });
      cancelEditLift();
    } catch (e) {
      console.error(e);
      showAlert("Update failed", "Could not update exercise name.");
    }
  };

  const deleteLift = async (liftId: string) => {
    if (!user) return;

    const ok = Platform.OS === "web" ? window.confirm("Delete this exercise?") : true;
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "otherLifts", liftId));
      if (openLiftId === liftId) setOpenLiftId(null);
    } catch (e) {
      console.error(e);
      showAlert("Delete failed", "Could not delete exercise.");
    }
  };

  const toggleOpen = (liftId: string) => {
    setEditingSetId(null);
    setSetWeight("");
    setSetReps("");
    setOpenLiftId((cur) => (cur === liftId ? null : liftId));
  };

  const addSet = async () => {
    if (!user || !openLiftId) return;

    const v = validateSet(setWeight, setReps);
    if (!v.ok) return showAlert("Fix required", v.msg);

    try {
      setSavingSet(true);
      await addDoc(collection(db, "users", user.uid, "otherLifts", openLiftId, "sets"), {
        weightKg: Number(setWeight),
        reps: Number(setReps),
        createdAt: serverTimestamp(),
      });
      setSetWeight("");
      setSetReps("");
    } catch (e) {
      console.error(e);
      showAlert("Save failed", "Could not add set.");
    } finally {
      setSavingSet(false);
    }
  };

  const startEditSet = (s: LiftSet) => {
    setEditingSetId(s.id);
    setEditSetWeight(String(s.weightKg));
    setEditSetReps(String(s.reps));
  };

  const cancelEditSet = () => {
    setEditingSetId(null);
    setEditSetWeight("");
    setEditSetReps("");
  };

  const saveEditSet = async (setId: string) => {
    if (!user || !openLiftId) return;

    const v = validateSet(editSetWeight, editSetReps);
    if (!v.ok) return showAlert("Fix required", v.msg);

    try {
      await updateDoc(
        doc(db, "users", user.uid, "otherLifts", openLiftId, "sets", setId),
        {
          weightKg: Number(editSetWeight),
          reps: Number(editSetReps),
        }
      );
      cancelEditSet();
    } catch (e) {
      console.error(e);
      showAlert("Update failed", "Could not update set.");
    }
  };

  const deleteSet = async (setId: string) => {
    if (!user || !openLiftId) return;

    const ok = Platform.OS === "web" ? window.confirm("Delete this set?") : true;
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "otherLifts", openLiftId, "sets", setId));
    } catch (e) {
      console.error(e);
      showAlert("Delete failed", "Could not delete set.");
    }
  };

  const openLift = useMemo(() => lifts.find((l) => l.id === openLiftId), [lifts, openLiftId]);

  if (loading || !user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Other Lifts</Text>
      <Text style={styles.subtitle}>
        Add any exercise (Incline DB Press, Leg Press, Dips). Tap an exercise to log weight + reps.
      </Text>

      {/* Add exercise */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Exercise</Text>
        <TextInput
          value={newName}
          onChangeText={(t) => setNewName(sanitizeName(t))}
          placeholder="e.g. Incline DB Press"
          placeholderTextColor="#777"
          style={styles.input}
        />
        <Pressable
          style={[styles.bigBtn, (savingLift || !newName.trim()) && styles.bigBtnDisabled]}
          onPress={addLift}
          disabled={savingLift || !newName.trim()}
        >
          <Text style={styles.bigBtnText}>{savingLift ? "Saving..." : "Add Exercise"}</Text>
        </Pressable>
      </View>








            {/* List exercises */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>My Exercises</Text>

        {dataLoading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : lifts.length === 0 ? (
          <Text style={styles.muted}>No exercises yet.</Text>
        ) : (
          lifts.map((lift) => (
            <View key={lift.id} style={styles.rowBlock}>
              {/* HEADER (edit mode OR normal mode) */}
              {editingLiftId === lift.id ? (
                <>
                  <TextInput
                    value={editLiftName}
                    onChangeText={(t) => setEditLiftName(sanitizeName(t))}
                    placeholder="Exercise name"
                    placeholderTextColor="#777"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.smallBtn}
                      onPress={() => saveEditLift(lift.id)}
                    >
                      <Text style={styles.smallBtnText}>Save</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.smallBtn, styles.smallBtnDark]}
                      onPress={cancelEditLift}
                    >
                      <Text style={styles.smallBtnText}>Cancel</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Pressable
                      style={[styles.smallBtn, { marginRight: 10 }]}
                      onPress={() => toggleOpen(lift.id)}
                    >
                      <Text style={styles.smallBtnText}>
                        {openLiftId === lift.id ? "−" : "+"}
                      </Text>
                    </Pressable>

                    <Text style={styles.listText}>
                      <Text style={styles.bold}>{lift.name}</Text>
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      style={styles.smallBtn}
                      onPress={() => startEditLift(lift)}
                    >
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

              {/* ✅ OPEN SECTION (this is OUTSIDE the ternary now) */}
              {openLiftId === lift.id && (
                <View style={styles.openBox}>
                  <Text style={styles.openTitle}>Log Sets for: {lift.name}</Text>

                  {/* Add set */}
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                    <TextInput
                      value={setWeight}
                      onChangeText={(t) => setSetWeight(sanitizeNumber(t))}
                      placeholder="Weight (kg)"
                      placeholderTextColor="#777"
                      keyboardType="numeric"
                      style={[styles.input, { flex: 1 }]}
                    />
                    <TextInput
                      value={setReps}
                      onChangeText={(t) => setSetReps(sanitizeInt(t))}
                      placeholder="Reps"
                      placeholderTextColor="#777"
                      keyboardType="numeric"
                      style={[styles.input, { width: 90 }]}
                    />
                    <Pressable
                      style={[
                        styles.smallBtn,
                        (savingSet || !setWeight || !setReps) && styles.bigBtnDisabled,
                      ]}
                      onPress={addSet}
                      disabled={savingSet || !setWeight || !setReps}
                    >
                      <Text style={styles.smallBtnText}>
                        {savingSet ? "..." : "Add"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Sets list */}
                  <View style={styles.setList}>
                    {setsLoading ? (
                      <Text style={styles.muted}>Loading sets…</Text>
                    ) : sets.length === 0 ? (
                      <Text style={styles.muted}>No sets yet.</Text>
                    ) : (
                      sets.map((s) => (
                        <View key={s.id} style={styles.setRow}>
                          {editingSetId === s.id ? (
                            <>
                              <TextInput
                                value={editSetWeight}
                                onChangeText={(t) =>
                                  setEditSetWeight(sanitizeNumber(t))
                                }
                                placeholder="kg"
                                placeholderTextColor="#777"
                                keyboardType="numeric"
                                style={[styles.input, { width: 120 }]}
                              />
                              <TextInput
                                value={editSetReps}
                                onChangeText={(t) =>
                                  setEditSetReps(sanitizeInt(t))
                                }
                                placeholder="reps"
                                placeholderTextColor="#777"
                                keyboardType="numeric"
                                style={[styles.input, { width: 90 }]}
                              />
                              <Pressable
                                style={styles.smallBtn}
                                onPress={() => saveEditSet(s.id)}
                              >
                                <Text style={styles.smallBtnText}>Save</Text>
                              </Pressable>
                              <Pressable
                                style={[styles.smallBtn, styles.smallBtnDark]}
                                onPress={cancelEditSet}
                              >
                                <Text style={styles.smallBtnText}>Cancel</Text>
                              </Pressable>
                            </>
                          ) : (
                            <>
                              <Text style={styles.listText}>
                                <Text style={styles.bold}>{s.weightKg} kg</Text> x{" "}
                                {s.reps}
                              </Text>
                              <View style={styles.actions}>
                                <Pressable
                                  style={styles.smallBtn}
                                  onPress={() => startEditSet(s)}
                                >
                                  <Text style={styles.smallBtnText}>Edit</Text>
                                </Pressable>
                                <Pressable
                                  style={[styles.smallBtn, styles.smallBtnDanger]}
                                  onPress={() => deleteSet(s.id)}
                                >
                                  <Text style={styles.smallBtnText}>Delete</Text>
                                </Pressable>
                              </View>
                            </>
                          )}
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Back */}
      <Pressable style={styles.backBtn} onPress={() => router.replace("/mainMenu")}>
        <Text style={styles.backBtnText}>Back to Main Menu</Text>
      </Pressable>
    </ScrollView>
  );
}







const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 24 },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 6 },
  subtitle: { color: "#aaa", textAlign: "center", marginBottom: 18, lineHeight: 18 },

  card: { backgroundColor: "#1c1c1c", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 10 },
  muted: { color: "#aaa" },

  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },

  bigBtn: { marginTop: 12, backgroundColor: "#e10600", padding: 16, borderRadius: 10, alignItems: "center" },
  bigBtnDisabled: { opacity: 0.5 },
  bigBtnText: { color: "#fff", fontWeight: "800" },

  rowBlock: {
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    paddingTop: 12,
    marginTop: 12,
    gap: 10,
  },

  listText: { color: "#ccc" },
  bold: { color: "#fff", fontWeight: "800" },

  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  smallBtn: { backgroundColor: "#e10600", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  smallBtnDark: { backgroundColor: "#333" },
  smallBtnDanger: { backgroundColor: "#7a0000" },
  smallBtnText: { color: "#fff", fontWeight: "800" },

  openBox: {
    marginTop: 10,
    backgroundColor: "#161616",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  openTitle: { color: "#fff", fontWeight: "800" },

  setList: { marginTop: 12, borderTopWidth: 1, borderTopColor: "#2a2a2a", paddingTop: 10 },
  setRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  backBtn: { marginTop: 10, backgroundColor: "#e10600", padding: 16, borderRadius: 10, alignItems: "center" },
  backBtnText: { color: "#fff", fontWeight: "800" },
});