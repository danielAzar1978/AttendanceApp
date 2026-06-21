import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ראשי",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="home" size={focused ? 32 : 28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "היסטוריה",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="history"
              size={focused ? 32 : 28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "חשבון",
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="person"
              size={focused ? 32 : 28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen />
    </Tabs>
  );
}
