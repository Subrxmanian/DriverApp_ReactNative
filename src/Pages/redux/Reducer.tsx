// redux/reducers.js
import { DRIVER_DATA, UPDATE_USER_DATA } from "./ActionTypes";

const initialState = {
  userData: {
    profile: {
      profilePicture: ''
    },
    fcmToken:"",
    fullName: "",
    mobileNumber: "",
    phoneNumber: "",
    preferredLanguage: "",
    preferredState: "",  
    whatsappNumber: "",
    onDuty: true,
    isVerified: true,
    vehicleDetails: {
      frontImgUrl: "",
      backImgUrl: "",
      vehicleNumber: "",
      brand: "",
      model:"",
      wheels:"",
      category:"",      
      ownVehicle: "",
      fuelType: "",
      fcExpiryDate: "",
      insuranceExpiryDate: "",
      vehicleOwnerName: "",
      ownerNumber: ""
    },
    drivingLicense: {
      frontImgUrl: "",
      backImgUrl: "",
      drivingLicenseNumber: "",
      expiryDate: ""
    },
    aadhaarCard: {
      frontImgUrl: "",
      sideImgUrl: "",
      aadhaarNumber: ""
    },
    componnet1:false,
    componnet2:false,
    componnet3:false,
    componnet4:false
  },
  drivers:{},
  
};

const rootReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case UPDATE_USER_DATA:
      return {
        ...state,
        userData: {
          ...state.userData,
          ...action.payload, // This will update only the properties passed in the payload
        },
      };
      case DRIVER_DATA:
        return {
          ...state,
        drivers: {
            ...state.drivers,
            ...action.payload, // This will update only the properties passed in the payload
          },
        };
    default:
      return state;
  }
};

export default rootReducer;
