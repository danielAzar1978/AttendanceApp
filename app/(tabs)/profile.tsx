import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const [name, setName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("name");

      if (storedName) {
        setName(storedName);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("token");

    router.replace("/login");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f7fb",
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 30,
          marginBottom: 20,
        }}
      >
        חשבון
      </Text>

      <View
        style={{
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginBottom: 8,
          }}
        >
          משתמש מחובר
        </Text>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {name}
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: "#dc2626",
          padding: 16,
          borderRadius: 14,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          התנתק
        </Text>
      </TouchableOpacity>
    </View>
  );
}
