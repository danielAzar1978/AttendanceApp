import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type RecordItem = {
  type: string;
  text: string;
  latitude: number;
  longitude: number;
};

export default function History() {
  const [records, setRecords] = useState<RecordItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadRecords = async () => {
        const storedUserId = await AsyncStorage.getItem("userId");

        if (!storedUserId) {
          return;
        }
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          `http://10.0.0.3:5146/api/attendance/history/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        const formatted = data.map((item: any) => ({
          type: item.type,
          text: `${item.type} בתאריך ${new Date(item.attendanceTime).toLocaleDateString()}
בשעה ${new Date(item.attendanceTime).toLocaleTimeString()}`,
          latitude: item.latitude,
          longitude: item.longitude,
        }));

        setRecords(formatted);
      };

      loadRecords();
    }, []),
  );

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, textAlign: "center", fontWeight: "bold" }}>
        היסטוריית החתמות
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: "gray", padding: 15, borderRadius: 10 }}
        onPress={() => router.back()}
      >
        <Text style={{ color: "white", textAlign: "center" }}>חזרה</Text>
      </TouchableOpacity>

      <FlatList
        data={records}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: item.type === "כניסה" ? "green" : "red",
                textAlign: "right",
              }}
            >
              {item.text}
              <Text style={{ textAlign: "right", fontSize: 13, color: "#555" }}>
                מיקום: {item.latitude}, {item.longitude}
              </Text>
            </Text>
          </View>
        )}
      />
    </View>
  );
}
