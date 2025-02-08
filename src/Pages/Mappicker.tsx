import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

export const requestAppPermissions = async () => {
  // Explicitly define all required permissions
  const permissionsToRequest = Platform.OS === 'android' 
    ? [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.RECORD_AUDIO
      ]
    : [
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MEDIA_LIBRARY,
        PERMISSIONS.IOS.MICROPHONE
      ];

  try {
    // Track permission results
    const permissionResults = {};

    // Request each permission systematically
    for (const permission of permissionsToRequest) {
      if (!permission) {
        console.warn('Null permission encountered');
        continue;
      }

      try {
        const result = await request(permission);
        permissionResults[permission] = result;
      } catch (permissionError) {
        console.error(`Error requesting permission ${permission}:`, permissionError);
        permissionResults[permission] = 'ERROR';
      }
    }

    // Check if all critical permissions are granted
    const allCriticalPermissionsGranted = permissionsToRequest.every(
      permission => permissionResults[permission] === RESULTS.GRANTED
    );

    if (!allCriticalPermissionsGranted) {
      // Optional: Show an alert about missing permissions
      Alert.alert(
        'Permissions Required', 
        'Some app features may be limited without all permissions.',
        [{ text: 'OK' }]
      );
    }

    return {
      allPermissionsGranted: allCriticalPermissionsGranted,
      permissionResults
    };

  } catch (error) {
    console.error('Comprehensive permission request failed:', error);
    
    // Optional: More detailed error handling
    Alert.alert(
      'Permission Error', 
      'Unable to process permissions. Please check app settings.',
      [{ text: 'OK' }]
    );

    return {
      allPermissionsGranted: false,
      error: error.message
    };
  }
};

