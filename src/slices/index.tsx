import { combineReducers } from "redux";

import alertsReducer from "./alerts";
import authReducer from "./auth";
import configReducer from "./config";
import dataReducer from "./data";

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  config: configReducer,
  data: dataReducer,
});

export default rootReducer;