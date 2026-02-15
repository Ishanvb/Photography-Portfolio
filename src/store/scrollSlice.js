import { createSlice } from '@reduxjs/toolkit';

const scrollSlice = createSlice({
  name: 'scroll',
  initialState: {
    isManualScrolling: false,
  },
  reducers: {
    setManualScrolling(state, action) {
      state.isManualScrolling = action.payload;
    },
  },
});

export const { setManualScrolling } = scrollSlice.actions;
export default scrollSlice.reducer;
