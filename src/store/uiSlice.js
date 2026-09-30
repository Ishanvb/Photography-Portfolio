import { createSlice } from '@reduxjs/toolkit';

const hasLoadedKey = 'mariPortfolioLoaded';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isFirstVisit: typeof sessionStorage !== 'undefined' ? !sessionStorage.getItem(hasLoadedKey) : true,
    isLoading: typeof sessionStorage !== 'undefined' ? !sessionStorage.getItem(hasLoadedKey) : true,
    contentReady: typeof sessionStorage !== 'undefined' ? !!sessionStorage.getItem(hasLoadedKey) : false,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  },
  reducers: {
    setContentReady(state, action) {
      state.contentReady = action.payload;
    },
    setMobile(state, action) {
      state.isMobile = action.payload;
    },
    markLoaded(state) {
      state.isLoading = false;
    },
  },
});

export const { setContentReady, setMobile, markLoaded } = uiSlice.actions;
export default uiSlice.reducer;
