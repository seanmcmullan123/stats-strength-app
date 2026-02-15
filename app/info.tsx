import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { Link } from "expo-router";

export default function Info() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <Text style={styles.title}>Stats & Strength 💪</Text>
      <Text style={styles.subtitle}>
        Track your progress. Measure your strength. Compare yourself — past and
        present
      </Text>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What is this app?</Text>

        <Text style={styles.text}>
          Stats & Strength is a strength-training companion designed to help you
          track your lifts and monitor progress over time.
        </Text>

        <Text style={styles.text}>
          You’ll track weekly, monthly, and yearly progress using stats and
          the progress graph for each time you hit a new PR!
          </Text>

           <Text style={styles.text}></Text>

          <Text style={styles.title}>Below is the current World records for the heaviest Squat, Bench and Deadlift in history!!!</Text>
      </View>

      {/* Squat */}
      <View style={styles.card}>
        <Text style={styles.liftTitle}>Squat</Text>
        <Text style={styles.record}>🌍 World Record: 490 kg</Text>
        <Text style={styles.athlete}>Ray Williams</Text>

        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/images/ray-williams-490kg-squat.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bench */}
      <View style={styles.card}>
        <Text style={styles.liftTitle}>Bench Press</Text>
        <Text style={styles.record}>🌍 World Record: 355 kg</Text>
        <Text style={styles.athlete}>Julius Maddox</Text>

        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/images/julius-355kg-bench.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>


      {/* Deadlift */}
      <View style={styles.card}>
        <Text style={styles.liftTitle}>Deadlift</Text>
        <Text style={styles.record}>🌍 World Record: 510 kg</Text>
        <Text style={styles.athlete}>Hafþór Björnsson</Text>

        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/images/thor-510-deadlift.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>








      {/* Key Features */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        <Text style={styles.bullet}>• Lift tracking & history</Text>
        <Text style={styles.bullet}>• Weekly / monthly / yearly progress</Text>
        <Text style={styles.bullet}>• 1 Rep Max calculator</Text>
        <Text style={styles.bullet}>• Compare vs yourself over time</Text>
      </View>

      {/* Back Button */}
      <Link href="/" asChild>
        <Pressable style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1c1c1c",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  liftTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  record: {
    color: "#e10600",
    marginTop: 4,
    fontWeight: "600",
  },
  athlete: {
    color: "#aaa",
    marginBottom: 10,
  },
  text: {
    color: "#ccc",
    marginTop: 8,
    lineHeight: 20,
  },
  bullet: {
    color: "#ccc",
    marginTop: 4,
  },
  imageWrapper: {
    backgroundColor: "#000",
    borderRadius: 10,
    height: 240,
    marginVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    backgroundColor: "#e10600",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
