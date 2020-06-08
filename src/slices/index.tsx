import { combineReducers } from "redux";

import alertsReducer from "./alerts";
import authReducer from "./auth";
import boardsReducer from "./boards";
import configReducer from "./config";
import issuesReducer from "./issues";
import sprintsReducer from "./sprints";
import userReducer from "./user";

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  boards: boardsReducer,
  config: configReducer,
  issues: issuesReducer,
  sprints: sprintsReducer,
  user: userReducer,
});

export default rootReducer;