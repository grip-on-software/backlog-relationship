import { combineReducers } from "redux";

import alertsReducer from "./alerts";
import authReducer from "./auth";
import boardsReducer from "./boards";
import configReducer from "./config";
import issueLinkTypesReducer from "./issueLinkTypes";
import issueTypesReducer from "./issueTypes";
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
  issueLinkTypes: issueLinkTypesReducer,
  issueTypes: issueTypesReducer,
  issues: issuesReducer,
  sprints: sprintsReducer,
  statusCategories: statusCategoriesReducer,
  statuses: statusesReducer,
  user: userReducer,
});

export default rootReducer;