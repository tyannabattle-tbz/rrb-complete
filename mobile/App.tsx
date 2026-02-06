import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import GPSScreen from './screens/GPSScreen';
import HybridCastScreen from './screens/HybridCastScreen';
import BroadcastsScreen from './screens/BroadcastsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'GPS') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'HybridCast') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#8B8B8B',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <Tab.Screen
        name="GPS"
        component={GPSScreen}
        options={{ title: 'GPS Map' }}
      />
      <Tab.Screen
        name="HybridCast"
        component={HybridCastScreen}
        options={{ title: 'HybridCast' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');

        // Request notification permission
        const { status: notificationStatus } =
          await Notifications.requestPermissionsAsync();

        // Set up notification listener
        const subscription = Notifications.addNotificationResponseListener(
          (response) => {
            // Handle notification response
            console.log('Notification received:', response.notification);
          }
        );

        setIsReady(true);

        return () => subscription.remove();
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true);
      }
    }

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0066FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={HomeTabs}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen
            name="Broadcasts"
            component={BroadcastsScreen}
            options={{
              headerShown: true,
              title: 'Broadcasts',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
