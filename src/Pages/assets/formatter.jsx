import AsyncStorage from '@react-native-async-storage/async-storage';

// Format time for display
export const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const getData = async(key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data;
   } catch (error) {
     console.log("error retrieving data from async storage...")
     return error;
   }
}

export const setData = async(key, value) => {
  try {
    await AsyncStorage.setItem(key, (value).toString());
   } catch (error) {
     console.log("error saving data to async storage...")
     return error;
   }
}