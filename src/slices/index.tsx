import { combineReducers } from "redux";

import alertsReducer from "./alerts";
import authReducer from "./auth";
import boardsReducer from "./boards";
import configReducer from "./config";
import dataReducer from "./data";
import userReducer from "./user";

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  boards: boardsReducer,
  config: configReducer,
  data: dataReducer,
  user: userReducer,
});

export default rootReducer;