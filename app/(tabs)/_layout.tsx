import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const coral = "#EB6F61";
const muted = "#9BA7A2";

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: coral, tabBarInactiveTintColor: muted, tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 3 }, tabBarStyle: { height: 82, paddingTop: 10, borderTopColor: "#E5EBE7", backgroundColor: "#FFFFFF" }, tabBarHideOnKeyboard: true }}>
    <Tabs.Screen name="index" options={{ title: "Overview", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="transactions" options={{ title: "Records", tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="reports" options={{ title: "Reports", tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} /> }} />
  </Tabs>;
}
