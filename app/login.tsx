import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async () => {
 if (username === 'admin' && password === '1234') {
  setError('');

  await AsyncStorage.setItem('isLoggedIn', 'true');

  router.replace('/(tabs)');
} else {
    setError('שם משתמש או סיסמה שגויים');
  }
};

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 28, textAlign: 'center', fontWeight: 'bold' }}>
        התחברות
      </Text>

      <TextInput
        placeholder="שם משתמש"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="סיסמה"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 12,
          borderRadius: 8,
        }}
      />

      <TouchableOpacity
        style={{
          backgroundColor: 'blue',
          padding: 15,
          borderRadius: 10,
        }}
        onPress={handleLogin}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>
          התחבר
        </Text>
      </TouchableOpacity>
      <Text style={{ color: 'red', textAlign: 'center' }}>
  {error}
</Text>
    </View>
  );
}