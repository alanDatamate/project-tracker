import {
  createSlice
} from "@reduxjs/toolkit";

const initialState = {
  status: "All",
  assignee: "All",
  project: "All",
  projects: [],
  seletedAssignees: [],
  projectStatuses: [],
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  searchResults: [],
  endDateStatusName : "",
  endDateStatusKey : "",
  issuesFetched : false
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setSeletedAssignees: (state, action) => {
      state.seletedAssignees = action.payload;
    },
    setProject: (state, action) => {
      state.project = action.payload;
    },
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    setProjectStatuses: (state, action) => {
      state.projectStatuses = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setEndDateStatusName: (state, action) => {
      state.endDateStatusName = action.payload;
    },
    setEndDateStatusKey: (state, action) => {
      state.endDateStatusKey = action.payload;
    },
    setIssuesFetched: (state, action) => {
      state.issuesFetched = action.payload;
    }
  },
});

export const {
  setStatus,
  setProject,
  setProjects,
  setStartDate,
  setEndDate,
  setProjectStatuses,
  setSeletedAssignees,
  setSearchResults,
  setEndDateStatusKey,
  setEndDateStatusName,
  setIssuesFetched
} = filtersSlice.actions;

export default filtersSlice.reducer;