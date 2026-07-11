import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import NetInfo from "@react-native-community/netinfo";

type PendingAttendance = {
  clientRecordId: string;
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
  const [syncMessage, setSyncMessage] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 10000);
  };

  const showSyncMessage = (text: string) => {
    setSyncMessage(text);

    setTimeout(() => {
      setSyncMessage("");
    }, 10000);
  };

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await AsyncStorage.getItem("name");

      if (storedName) {
        setName(storedName);
      }
    };

    loadUser();
    updatePendingCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncPendingAttendances();
    }, []),
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingAttendances();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const savePendingAttendance = async (attendance: PendingAttendance) => {
    const stored = await AsyncStorage.getItem("pendingAttendances");

    const pending: PendingAttendance[] = stored ? JSON.parse(stored) : [];

    pending.push(attendance);

    await AsyncStorage.setItem("pendingAttendances", JSON.stringify(pending));
    await updatePendingCount();
  };

  const updatePendingCount = async () => {
    const stored = await AsyncStorage.getItem("pendingAttendances");
    const pending: PendingAttendance[] = stored ? JSON.parse(stored) : [];

    setPendingCount(pending.length);
  };

  const sendPendingAttendances = async () => {
    const stored = await AsyncStorage.getItem("pendingAttendances");

    if (!stored) {
      return;
    }

    const pending: PendingAttendance[] = JSON.parse(stored);

    if (pending.length === 0) {
      return;
    }

    const token = await AsyncStorage.getItem("token");
    console.log("token exists:", !!token);

    if (!token) {
      return;
    }

    const remaining: PendingAttendance[] = [];
    let syncedCount = 0;

    for (const attendance of pending) {
      try {
        const response = await fetch(
          "http://10.0.0.3:5146/api/attendance/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(attendance),
          },
        );

        const responseData = await response.json();

        if (!response.ok) {
          console.log("Pending rejected:", response.status, responseData);

          if (response.status >= 500) {
            // תקלה זמנית בשרת — נשאיר לשליחה חוזרת
            remaining.push(attendance);
          } else {
            // שגיאה עסקית או מיקום לא מורשה — לא ננסה שוב לנצח
            showMessage(
              responseData.message || "החתמה ממתינה נדחתה על ידי השרת",
            );
          }
        } else {
          syncedCount++;
        }
      } catch {
        remaining.push(attendance);
      }
    }
    await AsyncStorage.setItem("pendingAttendances", JSON.stringify(remaining));

    await updatePendingCount();

    if (syncedCount === 1) {
      showSyncMessage("✅ החתמה נשלחה בהצלחה");
    } else if (syncedCount > 1) {
      showSyncMessage(`✅ ${syncedCount} החתמות נשלחו בהצלחה`);
    }
  };
  const syncPendingAttendances = async () => {
    await sendPendingAttendances();
  };

  const handlePress = async (type: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      showMessage("אין הרשאת מיקום");
      return;
    }

    const storedUserId = await AsyncStorage.getItem("userId");

    if (!storedUserId) {
      showMessage("משתמש לא מחובר");
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
      showMessage("לא הצלחתי לקבל מיקום");
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString("he-IL");
    const time = now.toLocaleTimeString("he-IL");

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      showMessage("אין token");
      return;
    }

    const clientRecordId = uuidv4();

    const attendanceToSend: PendingAttendance = {
      clientRecordId,
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
      const data = await response.json();

      console.log("Attendance response status:", response.status);
      console.log("Attendance response body:", data);

      if (!response.ok) {
        showMessage(data.message || "שגיאה בשמירה לשרת");
        return;
      }

      const locationName = data.locationName || "מיקום מאושר";

      setLastCheck(`${type} • ${time} • ${locationName}`);

      showMessage(
        `✅ ${type} נשמרה בהצלחה
בתאריך ${date} בשעה ${time}
📍 ${locationName}`,
      );
    } catch {
      await savePendingAttendance(attendanceToSend);

      showMessage(
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
      <View
        style={{
          backgroundColor: pendingCount > 0 ? "#fff7ed" : "#ecfdf5",
          borderWidth: 1,
          borderColor: pendingCount > 0 ? "#fdba74" : "#86efac",
          borderRadius: 14,
          padding: 12,
          marginTop: 12,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: pendingCount > 0 ? "#c2410c" : "#15803d",
            fontSize: 15,
          }}
        >
          {pendingCount > 0
            ? `🟠 ${pendingCount} ${
                pendingCount === 1 ? "החתמה ממתינה" : "החתמות ממתינות"
              } לשליחה`
            : "🟢 כל ההחתמות נשלחו לשרת"}
        </Text>
      </View>
      {syncMessage ? (
        <View
          style={{
            backgroundColor: "#eff6ff",
            borderWidth: 1,
            borderColor: "#93c5fd",
            borderRadius: 14,
            padding: 12,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#1d4ed8",
              fontWeight: "600",
            }}
          >
            {syncMessage}
          </Text>
        </View>
      ) : null}
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
