import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

type RecordItem = {
  type: string;
  text: string;
};

export default function History() {
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      const stored = await AsyncStorage.getItem('records');

      if (stored) {
        setRecords(JSON.parse(stored));
      }
    };

    loadRecords();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>
        היסטוריית החתמות
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: 'gray', padding: 15, borderRadius: 10 }}
        onPress={() => router.back()}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>חזרה</Text>
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
              backgroundColor: '#f5f5f5',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: item.type === 'כניסה' ? 'green' : 'red',
                textAlign: 'right',
              }}
            >
              {item.text}
            </Text>
          </View>
        )}
      />
    </View>
  );
}