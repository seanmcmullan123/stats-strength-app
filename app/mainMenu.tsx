
import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function MainMenu() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("Your Profile");
  const [age, setAge] = useState("--");
  const [height, setHeight] = useState("--");
  const [weight, setWeight] = useState("--");

  // 🏋️ PR States
  const [bestSquat, setBestSquat] = useState(0);
  const [bestBench, setBestBench] = useState(0);
  const [bestDeadlift, setBestDeadlift] = useState(0);

  const computeAge = (d: number, m: number, y: number): number => {
    const today = new Date();
    const dob = new Date(y, m - 1, d);
    let a = today.getFullYear() - dob.getFullYear();
    const md = today.getMonth() - dob.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace("/login");
        return;
      }

      setUser(u);

      try {
        // 🔹 Load profile
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const data: any = snap.data();

          setName(data?.name || "Your Profile");

          if (data?.dobDay && data?.dobMonth && data?.dobYear) {
            setAge(String(computeAge(data.dobDay, data.dobMonth, data.dobYear)));
          }

          if (data?.heightFeet !== undefined && data?.heightInches !== undefined) {
            setHeight(`${data.heightFeet}' ${data.heightInches}"`);
          }

          if (data?.weightKg !== undefined) {
            setWeight(`${data.weightKg} kg`);
          }
        }

        // 🔹 Load PRs (1RM only)
        const liftsQuery = query(
          collection(db, "lifts"),
          where("userId", "==", u.uid),
          where("reps", "==", 1)
        );

        const liftsSnap = await getDocs(liftsQuery);

        let squatMax = 0;
        let benchMax = 0;
        let deadliftMax = 0;

        liftsSnap.forEach((doc) => {
          const lift: any = doc.data();

          if (lift.type === "squat" && lift.weightKg > squatMax)
            squatMax = lift.weightKg;

          if (lift.type === "bench" && lift.weightKg > benchMax)
            benchMax = lift.weightKg;

          if (lift.type === "deadlift" && lift.weightKg > deadliftMax)
            deadliftMax = lift.weightKg;
        });

        setBestSquat(squatMax);
        setBestBench(benchMax);
        setBestDeadlift(deadliftMax);

      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  const total = bestSquat + bestBench + bestDeadlift;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#aaa", textAlign: "center" }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.stats}>
          Age: {age} | Height: {height} | Weight: {weight}
        </Text>

        {/* 🏆 TOTAL SECTION */}
        <View style={styles.totalBox}>
          <Text style={styles.totalTitle}>Current Best Total</Text>
          <Text style={styles.totalValue}>{total} kg</Text>

          <Text style={styles.breakdown}>
            Squat: {bestSquat} kg | Bench: {bestBench} kg | Deadlift: {bestDeadlift} kg
          </Text>
        </View>
      </View>

      <View style={styles.menu}>
        <Pressable style={styles.button} onPress={() => router.push("/editProfile")}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push("/enterLifts")}>
          <Text style={styles.buttonText}>Enter Lifts</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push("/myLifts")}>
          <Text style={styles.buttonText}>My Lifts</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push("/oneRepMax")}>
          <Text style={styles.buttonText}>1 Rep Max Calculator</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => router.push("/progress")}>
          <Text style={styles.buttonText}>PR Progress</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
  },
  header: {
    backgroundColor: "#1c1c1c",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  stats: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },

  totalBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#141414",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e10600",
  },
  totalTitle: {
    color: "#aaa",
    fontSize: 14,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#e10600",
    marginVertical: 6,
  },
  breakdown: {
    color: "#ccc",
    fontSize: 13,
    textAlign: "center",
  },

  menu: {
    flex: 1,
    gap: 14,
  },
  button: {
    backgroundColor: "#e10600",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#1c1c1c",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#ff4d4d",
    fontSize: 16,
    fontWeight: "600",
  },
});




