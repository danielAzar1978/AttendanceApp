import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://10.0.0.3:5146/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setError("");

        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("name", data.name);
        await AsyncStorage.setItem("userId", data.userId.toString());
        await AsyncStorage.setItem("token", data.token);

        router.replace("/(tabs)");
      } else {
        setError("שם משתמש או סיסמה שגויים");
      }
    } catch (error) {
      console.log(error);
      setError("שגיאה בחיבור לשרת");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f7fb",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 34,
            textAlign: "center",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          ברוך הבא
        </Text>

        <Text
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "#6b7280",
            marginBottom: 28,
          }}
        >
          התחברות למערכת החתמות
        </Text>

        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              textAlign: "right",
              marginBottom: 6,
              color: "#374151",
              fontWeight: "600",
            }}
          >
            שם משתמש
          </Text>

          <TextInput
            placeholder="הכנס שם משתמש"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              backgroundColor: "#f9fafb",
              padding: 14,
              borderRadius: 14,
              fontSize: 16,
              textAlign: "right",
            }}
          />
        </View>

        <View style={{ marginBottom: 18 }}>
          <Text
            style={{
              textAlign: "right",
              marginBottom: 6,
              color: "#374151",
              fontWeight: "600",
            }}
          >
            סיסמה
          </Text>

          <TextInput
            placeholder="הכנס סיסמה"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              backgroundColor: "#f9fafb",
              padding: 14,
              borderRadius: 14,
              fontSize: 16,
              textAlign: "right",
            }}
          />
        </View>

        {error ? (
          <View
            style={{
              backgroundColor: "#fee2e2",
              borderColor: "#fecaca",
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#b91c1c",
                textAlign: "center",
                fontSize: 15,
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={{
            backgroundColor: "#2563eb",
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
          }}
          onPress={handleLogin}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            התחבר
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
