import { combineReducers } from "redux";

import alertsReducer from "./alerts";
import authReducer from "./auth";
import boardsReducer from "./boards";
import configReducer from "./config";
import dataReducer from "./data";
import sprintsReducer from "./sprints";
import userReducer from "./user";

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  boards: boardsReducer,
  config: configReducer,
  data: dataReducer,
  sprints: sprintsReducer,
  user: userReducer,
});

export default rootReducer;