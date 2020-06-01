import { combineReducers } from 'redux';

import alertsReducer from './alerts';
import configReducer from './config';
import dataReducer from './data';

const rootReducer = combineReducers({
  alerts: alertsReducer,
  config: configReducer,
  data: dataReducer,
});

export default rootReducer;