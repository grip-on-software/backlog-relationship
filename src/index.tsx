import React from 'react';
import ReactDOM from 'react-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import App from './components/App';
import rootReducer from './slices'

import './index.scss';
import 'react-bootstrap-typeahead/css/Typeahead.scss';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.scss';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

const store = configureStore({ reducer: rootReducer });
export type RootState = ReturnType<typeof store.getState>;

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));
