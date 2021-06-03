import React from 'react'
import { ThemeProvider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import firebase from 'firebase/app'
import 'firebase/auth'
import { theme } from './src/core/theme'
import {
  AuthLoadingScreen,
  StartScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  UserDashboard,
  AdminDashboard,
  AdminReportDashboard,
  UserReportDashboard,
  CameraScreenPhoto,
  CameraScreenVideo,
  AudioRecordScreen
} from './src/screens'
import { FIREBASE_CONFIG } from './src/core/config'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import store from './src/redux/store'
import { Provider } from 'react-redux'

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator()

if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG)
  firebase.firestore().settings({ experimentalForceLongPolling: true });
}
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Soru İşlemleri') {
            iconName = focused
              ? 'ios-information-circle'
              : 'ios-information-circle-outline';
          } else if (route.name === 'Yapılan Raporlamalar') {
            iconName = focused ? 'ios-list-box' : 'ios-list';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Soru İşlemleri" component={AdminDashboard} />
      <Tab.Screen name="Yapılan Raporlamalar" component={AdminReportDashboard} />
    </Tab.Navigator>
  );
}
function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Sorular') {
            iconName = focused
              ? 'ios-information-circle'
              : 'ios-information-circle-outline';
          } else if (route.name === 'Yaptığım Raporlamalar') {
            iconName = focused ? 'ios-list-box' : 'ios-list';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Sorular" component={UserDashboard} />
      <Tab.Screen name="Yaptığım Raporlamalar" component={UserReportDashboard} />
    </Tab.Navigator>
  );
}
const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AuthLoadingScreen"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="AuthLoadingScreen"
              component={AuthLoadingScreen}
            />
            <Stack.Screen name="StartScreen" component={StartScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="Dashboard" component={UserTabNavigator} />
            <Stack.Screen name="AdminDashboard" component={AdminTabNavigator} />
            <Stack.Screen name="CameraScreenPhoto" component={CameraScreenPhoto} />
            <Stack.Screen name="CameraScreenVideo" component={CameraScreenVideo} />
            <Stack.Screen name="AudioRecordScreen" component={AudioRecordScreen} />
            <Stack.Screen
              name="ForgotPasswordScreen"
              component={ForgotPasswordScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  )
}

export default App
