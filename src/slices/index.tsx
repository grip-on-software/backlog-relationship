import { combineReducers } from "redux";

import alertsReducer from "./alerts";
import authReducer from "./auth";
import boardsReducer from "./boards";
import configReducer from "./config";
import issuesTypesReducer from "./issueTypes";
import issuesReducer from "./issues";
import sprintsReducer from "./sprints";
import statusCategoriesReducer from "./statusCategories";
import statusesReducer from "./statuses";
import userReducer from "./user";

const rootReducer = combineReducers({
  alerts: alertsReducer,
  auth: authReducer,
  boards: boardsReducer,
  config: configReducer,
  issueTypes: issuesTypesReducer,
  issues: issuesReducer,
  sprints: sprintsReducer,
  statusCategories: statusCategoriesReducer,
  statuses: statusesReducer,
  user: userReducer,
});

export default rootReducer;