import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type PendingAttendance = {
  userId: number;
  type: string;
  latitude: number;
  longitude: number;
  attendanceTime: string;
};

export default function Index() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [lastCheck, setLastCheck] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("name");

      if (storedName) {
        setName(storedName);
      }
    };

    loadUser();
  }, []);

  const savePendingAttendance = async (attendance: PendingAttendance) => {
    const stored = await AsyncStorage.getItem("pendingAttendances");

    const pending: PendingAttendance[] = stored ? JSON.parse(stored) : [];

    pending.push(attendance);

    await AsyncStorage.setItem("pendingAttendances", JSON.stringify(pending));
  };

  const handlePress = async (type: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setMessage("אין הרשאת מיקום");
      return;
    }

    const storedUserId = await AsyncStorage.getItem("userId");

    if (!storedUserId) {
      setMessage("משתמש לא מחובר");
      return;
    }

    const userId = parseInt(storedUserId);

    let latitude = 0;
    let longitude = 0;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
    } catch (error) {
      setMessage("לא הצלחתי לקבל מיקום");
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString("he-IL");
    const time = now.toLocaleTimeString("he-IL");

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setMessage("אין token");
      return;
    }

    const attendanceToSend: PendingAttendance = {
      userId,
      type,
      latitude,
      longitude,
      attendanceTime: now.toISOString(),
    };

    try {
      const response = await fetch(
        "http://10.0.0.3:5146/api/attendance/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(attendanceToSend),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || "שגיאה בשמירה לשרת");
        return;
      }

      const data = await response.json();
      const locationName = data.locationName || "מיקום מאושר";

      setLastCheck(`${type} • ${time} • ${locationName}`);

      setMessage(
        `✅ ${type} נשמרה בהצלחה
בתאריך ${date} בשעה ${time}
📍 ${locationName}`,
      );
    } catch {
      await savePendingAttendance(attendanceToSend);

      setMessage(
        `⚠️ אין חיבור לשרת
ההחתמה נשמרה במכשיר ותישלח אוטומטית בהמשך`,
      );
    }
  };

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
          fontSize: 34,
          textAlign: "center",
          fontWeight: "bold",
          marginTop: 35,
          color: "#111827",
        }}
      >
        החתמת נוכחות
      </Text>

      <Text
        style={{
          textAlign: "center",
          fontSize: 18,
          marginTop: 8,
          color: "#374151",
        }}
      >
        שלום {name} 👋
      </Text>

      <Text
        style={{
          textAlign: "center",
          fontSize: 20,
          color: "#6b7280",
          marginTop: 18,
        }}
      >
        {new Date().toLocaleDateString("he-IL")}
      </Text>

      <Text
        style={{
          textAlign: "center",
          fontSize: 24,
          color: "#111827",
          marginTop: 6,
          marginBottom: 24,
        }}
      >
        {new Date().toLocaleTimeString("he-IL")}
      </Text>

      <View
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: 14,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View style={{ flexDirection: "row", gap: 14 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#16a34a",
              paddingVertical: 50,
              borderRadius: 22,
              alignItems: "center",
            }}
            onPress={() => handlePress("כניסה")}
          >
            <MaterialIcons name="login" size={42} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 30,
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              כניסה
            </Text>
            <Text style={{ color: "white", fontSize: 14, marginTop: 6 }}>
              החתם כניסה לעבודה
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "#dc2626",
              paddingVertical: 50,
              borderRadius: 22,
              alignItems: "center",
            }}
            onPress={() => handlePress("יציאה")}
          >
            <MaterialIcons name="logout" size={42} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 30,
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              יציאה
            </Text>
            <Text style={{ color: "white", fontSize: 14, marginTop: 6 }}>
              החתם יציאה מהעבודה
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {lastCheck ? (
        <View
          style={{
            backgroundColor: "white",
            padding: 18,
            borderRadius: 20,
            marginTop: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              marginBottom: 8,
              color: "#15803d",
              textAlign: "right",
            }}
          >
            ✅ החתמה אחרונה
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#374151",
              textAlign: "right",
              lineHeight: 24,
            }}
          >
            {lastCheck}
          </Text>
        </View>
      ) : null}

      {message ? (
        <View
          style={{
            backgroundColor: "white",
            padding: 18,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            marginTop: 12,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              lineHeight: 25,
              color: "#111827",
            }}
          >
            {message}
          </Text>
        </View>
      ) : null}

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 8,
          marginBottom: 12,
        }}
      >
        <MaterialIcons name="logout" size={22} color="#6b7280" />
        <Text style={{ color: "#6b7280", fontSize: 14, marginLeft: 4 }}>
          התנתק
        </Text>
      </TouchableOpacity>
    </View>
  );
}
