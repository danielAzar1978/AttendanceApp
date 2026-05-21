import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type RecordItem = {
  type: string;
  text: string;
  latitude: number;
  longitude: number;
};

export default function Index() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [message, setMessage] = useState("");
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
  useEffect(() => {
    const loadRecords = async () => {
      const stored = await AsyncStorage.getItem("records");

      if (stored) {
        setRecords(JSON.parse(stored));
      }
    };

    loadRecords();
  }, []);

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
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // const newRecord: RecordItem = {
    //   type,
    //   text: `${type} בתאריך ${date} בשעה ${time}`,
    //   latitude,
    //   longitude,
    // };
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setMessage("אין token");
      return;
    }
    try {
      const response = await fetch(
        "http://10.0.0.3:5146/api/attendance/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            type,
            latitude,
            longitude,
          }),
        },
      );

      if (!response.ok) {
        setMessage("שגיאה בשמירה לשרת");
        return;
      }
    } catch (error) {
      setMessage("אין חיבור לשרת");
      return;
    }

    // const updatedRecords = [newRecord, ...records];

    // setRecords(updatedRecords);

    // // שמירה במכשיר
    // await AsyncStorage.setItem("records", JSON.stringify(updatedRecords));
    setMessage(
      `${type} נשמרה בהצלחה בתאריך ${date} בשעה ${time}
    מיקום: ${latitude}, ${longitude}`,
    );
  };
  const handleLogout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");

    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, textAlign: "center", fontWeight: "bold" }}>
        החתמת נוכחות
      </Text>
      <Text style={{ textAlign: "center", fontSize: 16 }}>שלום {name}</Text>

      <TouchableOpacity
        style={{ backgroundColor: "green", padding: 15, borderRadius: 10 }}
        onPress={() => handlePress("כניסה")}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>
          כניסה
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: "red", padding: 15, borderRadius: 10 }}
        onPress={() => handlePress("יציאה")}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 18 }}>
          יציאה
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: "blue", padding: 15, borderRadius: 10 }}
        onPress={() => router.push("/history")}
      >
        <Text style={{ color: "white", textAlign: "center" }}>להיסטוריה</Text>
      </TouchableOpacity>
      <Text style={{ textAlign: "center", fontSize: 16 }}>{message}</Text>

      <TouchableOpacity
        style={{ backgroundColor: "black", padding: 15, borderRadius: 10 }}
        onPress={handleLogout}
      >
        <Text style={{ color: "white", textAlign: "center" }}>התנתק</Text>
      </TouchableOpacity>
    </View>
  );
}
