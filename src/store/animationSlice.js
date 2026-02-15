import { createSlice } from '@reduxjs/toolkit';

const animationSlice = createSlice({
  name: 'animation',
  initialState: {
    headerAnimations: {
      date: false,
      image: false,
      title: false,
      body: false,
    },
  },
  reducers: {
    resetHeaderAnimations(state) {
      state.headerAnimations = { date: false, image: false, title: false, body: false };
    },
    setHeaderAnimationsBatch(state, action) {
      Object.assign(state.headerAnimations, action.payload);
    },
  },
});

export const { resetHeaderAnimations, setHeaderAnimationsBatch } = animationSlice.actions;
export default animationSlice.reducer;
