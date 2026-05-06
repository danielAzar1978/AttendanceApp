import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const value = await AsyncStorage.getItem('isLoggedIn');

      setIsLoggedIn(value === 'true');
    };

    checkLogin();
  }, []);

  if (isLoggedIn === null) {
    return null;
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}