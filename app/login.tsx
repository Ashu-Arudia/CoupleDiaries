import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Enter email" style={styles.input} />
      <TextInput placeholder="Enter password " style={styles.input} secureTextEntry />
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  input: { width: "80%", backgroundColor: "#333", color: "#fff", padding: 10, marginVertical: 5, borderRadius: 5 },
  button: { backgroundColor: "#ff4081", padding: 15, borderRadius: 10, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});
