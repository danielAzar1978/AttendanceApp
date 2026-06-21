import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type RecordItem = {
  id: number;
  type: string;
  attendanceTime: string;
  address: string;
};

export default function History() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      const loadRecords = async () => {
        const storedUserId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");

        if (!storedUserId || !token) {
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

        const formatted: RecordItem[] = data.map((item: any) => ({
          id: item.id,
          type: item.type,
          attendanceTime: item.attendanceTime,
          address: item.address || "מיקום מאושר",
        }));

        setRecords(formatted);
      };

      loadRecords();
    }, []),
  );

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const filteredRecords = records.filter((record) => {
    const date = new Date(record.attendanceTime);

    return (
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    );
  });

  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedYear, selectedMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedYear, selectedMonth + 1, 1));
  };

  const monthTitle = selectedDate.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

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
          color: "#111827",
        }}
      >
        החתמות
      </Text>

      <View
        style={{
          backgroundColor: "white",
          borderRadius: 18,
          padding: 14,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <View
          style={{
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Text style={{ fontSize: 16, color: "#2563eb" }}>חודש קודם</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            {monthTitle}
          </Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <Text style={{ fontSize: 16, color: "#2563eb" }}>חודש הבא</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
        ListEmptyComponent={
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              אין החתמות בחודש זה
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const date = new Date(item.attendanceTime);
          const isEntry = item.type === "כניסה";

          return (
            <View
              style={{
                backgroundColor: "white",
                padding: 18,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <View
                style={{
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: isEntry ? "#15803d" : "#b91c1c",
                  }}
                >
                  {isEntry ? "🟢 כניסה" : "🔴 יציאה"}
                </Text>

                <Text style={{ fontSize: 16, color: "#6b7280" }}>
                  {date.toLocaleTimeString("he-IL")}
                </Text>
              </View>

              <Text
                style={{
                  textAlign: "right",
                  fontSize: 16,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                {date.toLocaleDateString("he-IL")}
              </Text>

              <Text
                style={{
                  textAlign: "right",
                  fontSize: 15,
                  color: "#6b7280",
                  lineHeight: 22,
                }}
              >
                📍 {item.address}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
