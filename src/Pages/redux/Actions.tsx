// redux/actions.js
import { DRIVER_DATA, UPDATE_USER_DATA } from "./ActionTypes";
export const updateUserData = (newData) => ({
  type: UPDATE_USER_DATA,
  payload: newData,
});

export const updateDriverData = (newData) => ({
  type: DRIVER_DATA,
  payload: newData,
});