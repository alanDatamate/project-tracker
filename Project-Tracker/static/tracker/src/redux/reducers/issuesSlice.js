import {
  createSlice
} from "@reduxjs/toolkit";
import {
  invoke
} from "@forge/bridge";
const initialState = {
  issues: [],
  filteredIssues: [],
  loading: false,
  total: 0,
  SelectedStatusName: "",
};

const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    setIssues: (state, action) => {
      state.issues = action.payload;
      state.filteredIssues = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTotal: (state, action) => {
      state.total = action.payload;
    },
    setFilteredIssues: (state, action) => {
      state.filteredIssues = action.payload;
    },
    setSelectedStatusName: (state, action) => {
      state.SelectedStatusName = action.payload;
    },

  },
});

export const {
  setIssues,
  setLoading,
  setTotal,
  setFilteredIssues,
  setSelectedStatusName,
} = issuesSlice.actions;

export const fetchConflictingIssues = (startAt = 0, maxResults = 50, project, status, startDate, endDate, EndDateForConflictIssue, EndDateForConflictIssueKey , assignee) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    let jql = `project=${project}`;

    const response = await invoke("getConflictIssues", {
      startAt,
      maxResults,
      status,
      jql,
      startDate,
      endDate,
      EndDateForConflictIssue,
      EndDateForConflictIssueKey,
      assignee
    });
    dispatch(setIssues(response.issues));
    dispatch(setTotal(response.total));
  } catch (error) {
    console.error("Error fetching Jira issues:", error);
  } finally {
    dispatch(setLoading(false));
  }
};

export default issuesSlice.reducer;