import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type RecordItem = {
  type: string;
  text: string;
};

export default function Index() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
  const loadRecords = async () => {
    const stored = await AsyncStorage.getItem('records');

    if (stored) {
      setRecords(JSON.parse(stored));
    }
  };

  loadRecords();
}, []);

const handlePress = async (type: string) => {
  const { status } = await Location.requestForegroundPermissionsAsync();

if (status !== 'granted') {
  setMessage('אין הרשאת מיקום');
  return;
}
let latitude = 31.7683;
let longitude = 35.2137;
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const newRecord: RecordItem = {
    type,
    text: `${type} בתאריך ${date} בשעה ${time}`,
    latitude,
    longitude,
  };

  const updatedRecords = [newRecord, ...records];

  setRecords(updatedRecords);

  // שמירה במכשיר
  await AsyncStorage.setItem('records', JSON.stringify(updatedRecords));
  setMessage(
  `${type} נשמרה בהצלחה בתאריך ${date} בשעה ${time}
מיקום: ${latitude}, ${longitude}`
);
};

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: 'bold' }}>
        החתמת נוכחות
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: 'green', padding: 15, borderRadius: 10 }}
        onPress={() => handlePress('כניסה')}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>כניסה</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ backgroundColor: 'red', padding: 15, borderRadius: 10 }}
        onPress={() => handlePress('יציאה')}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>יציאה</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
  style={{ backgroundColor: 'blue', padding: 15, borderRadius: 10 }}
  onPress={() => router.push('/history')}
>
 <Text style={{ color: 'white', textAlign: 'center' }}>להיסטוריה</Text>
</TouchableOpacity>
<Text style={{ textAlign: 'center', fontSize: 16 }}>
  {message}
</Text>

  

     
    </View>
  );
}