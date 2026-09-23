import { Tabs } from "expo-router";
import { BarChart3, LayoutDashboard, ListFilter, Settings2 } from "lucide-react-native";

const coral = "#EB6F61";
const muted = "#9BA7A2";

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: coral, tabBarInactiveTintColor: muted, tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginBottom: 3 }, tabBarStyle: { height: 82, paddingTop: 10, borderTopColor: "#E5EBE7", backgroundColor: "#FFFFFF" }, tabBarHideOnKeyboard: true }}>
    <Tabs.Screen name="index" options={{ title: "Overview", tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} strokeWidth={1.9} /> }} />
    <Tabs.Screen name="transactions" options={{ title: "Records", tabBarIcon: ({ color, size }) => <ListFilter color={color} size={size} strokeWidth={1.9} /> }} />
    <Tabs.Screen name="reports" options={{ title: "Reports", tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} strokeWidth={1.9} /> }} />
    <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} strokeWidth={1.9} /> }} />
  </Tabs>;
}
