import {
  configureStore
} from "@reduxjs/toolkit";
import filtersReducer from "./reducers/filterSlice";
import issuesReducer from "./reducers/issuesSlice";

const store = configureStore({
  reducer: {
    filters: filtersReducer,
    issues: issuesReducer,
  },
});

export default store;