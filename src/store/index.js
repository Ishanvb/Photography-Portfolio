import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import scrollReducer from './scrollSlice';
import animationReducer from './animationSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    scroll: scrollReducer,
    animation: animationReducer,
  },
});

export default store;
