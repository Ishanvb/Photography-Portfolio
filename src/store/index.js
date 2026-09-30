import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import scrollReducer from './scrollSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    scroll: scrollReducer,
  },
});

export default store;
