// fieldsSlice.js (or wherever you store selected fields in Redux)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedFields: {},
};

const fieldsSlice = createSlice({
  name: "fields",
  initialState,
  reducers: {
    setSelectedField: (state, action) => {
      state.selectedFields = action.payload;
    },
  },
});

export const { setSelectedField } = fieldsSlice.actions;
export default fieldsSlice.reducer;
