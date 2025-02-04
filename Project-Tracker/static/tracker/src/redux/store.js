import {
  configureStore
} from "@reduxjs/toolkit";
import filtersReducer from "./reducers/filterSlice";
import issuesReducer from "./reducers/issuesSlice";
import fieldsReducer  from "./reducers/fieldSlice";

const store = configureStore({
  reducer: {
    filters: filtersReducer,
    issues: issuesReducer,
    fields : fieldsReducer 
  },
});

export default store;