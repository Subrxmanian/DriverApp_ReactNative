import React from 'react';
import Index from './src/index';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MobileVerify from './src/Components/MobileVerify';
import VendorVerify from './src/Components/VendorVerify';
import Info1 from './src/Components/Info1';
import Info2 from './src/Components/Info2';
import Info3 from './src/Components/Info3';
import VendorRegister from './src/Components/VendorRegister'
import Help from './src/Components/Help';
import VendorTabNavigation from './src/Components/VendorTabNavigation';
import otpView from './src/Components/Otp';
import Support from './src/Components/ContactSupport';
import Update from './src/Terms/Update';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Index}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Components/Info1"
          component={Info1}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="update"
          component={Update}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="Components/ContactSupport"
          component={Support}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Components/Otp"
          component={otpView}
          options={{ headerShown: false }}
        />
           <Stack.Screen
          name="Components/VendorTabNavigation"
          component={VendorTabNavigation}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="Components/Help"
          component={Help}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Components/VendorRegister"
          component={VendorRegister}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Components/Info2"
          component={Info2}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Components/Info3"
          component={Info3}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Components/VendorVerify"
          component={VendorVerify}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Components/MobileVerify"
          component={MobileVerify}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
