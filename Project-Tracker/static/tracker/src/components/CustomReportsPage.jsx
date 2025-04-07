import React, { useEffect, useState } from "react";
import JiraIssueList from "./JiraIssueList";
import ClientIssueTable from "./clientWiseReport/ClientIssueList";
import ResourceWiseIssueList from "./resourceWise/ResourceWiseIssueList";
import { setProject, setProjects } from "../redux/reducers/filterSlice";
import { useDispatch } from "react-redux";
import { setIssues } from "../redux/reducers/issuesSlice";
import TimeSheet from "./timeSheet/TimeSheet";
import { invoke } from "@forge/bridge";
import ResourceWiseCalender from "./resourceWise/calender/ResousrceWiseCalander";
import FetchPendingTasksForDevelopers from "./taskwiseReport/fetchPendingTasksForDevelopers";
import TaskWiseCompletedJobLists from "./completedJobsReport/TaskWiseCompletedJobLists";
import FetchIssuesForSprint from "./sprintBasedReport/fetchIssuesForSprint";

const CustomReportsPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await invoke("getProjects");
        dispatch(setProjects(response.projects));
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [dispatch]);
  const [activeTab, setActiveTab] = useState("delayed-tasks");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "time-sheet":
        return <TimeSheet />
      case "delayed-tasks":
        return <JiraIssueList />;
      case "client-wise":
        return <ClientIssueTable />;
      case "resource-wise":
        return <ResourceWiseIssueList />;
      case "resource-wise-calender":
        return <ResourceWiseCalender />;
      case "task-wise-pending-jobs":
        return <FetchPendingTasksForDevelopers />;
      case "task-wise-completed-jobs":
        return <TaskWiseCompletedJobLists />;
      case "sprint-based-filter":
        return <FetchIssuesForSprint />;
      default:
        return (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No Data Available
            </h2>
          </div>
        );
    }
  };
  useEffect(() => {
    dispatch(setProject("All"))
    dispatch(setIssues([]))
  }, [activeTab])

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-56 border-r border-gray-300 text-gray-700 font-sans px-6 pt-1">
        <h1 className="px-3 text-lg font-semibold mb-4">Reports </h1>
        <div className="w-full border-t border-gray-300 mb-4" />
        <div className="space-y-2 text-sm">
          <button
            onClick={() => setActiveTab("delayed-tasks")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${activeTab === "delayed-tasks"
                ? "text-blue-600 "
                : ""
              }`}
          >
            delayed-tasks
          </button>
          <button
            onClick={() => setActiveTab("client-wise")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${activeTab === "client-wise"
                ? "text-blue-600 "
                : ""
              }`}
          >
            client-wise
          </button>
          <button
            onClick={() => setActiveTab("resource-wise")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${activeTab === "resource-wise"
                ? "text-blue-600 "
                : ""
              }`}
          >
            resource-wise
          </button>
          <button
            onClick={() => setActiveTab("resource-wise-calender")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${activeTab === "resource-wise-calender"
                ? "text-blue-600"
                : ""
              }`}
          >
            Resource-wise-calender
          </button>
          <button
            onClick={() => setActiveTab("task-wise-pending-jobs")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${activeTab === "task-wise-pending-jobs"
                ? "text-blue-600"
                : ""
              }`}
          >
            Task-wise-pending-jobs
          </button>
          <button
            onClick={() => setActiveTab("task-wise-completed-jobs")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${activeTab === "task-wise-completed-jobs"
                ? "text-blue-600"
                : ""
              }`}
          >
            Task-wise-completed-jobs
          </button>
          <button
            onClick={() => setActiveTab("sprint-based-filter")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${activeTab === "sprint-based-filter"
                ? "text-blue-600"
                : ""
              }`}
          >
            sprint-based-filter
          </button>
        </div>
      </aside>
      <main className="flex-1 px-2.5 w-full overflow-x-auto">
        <div className="bg-white rounded-lg px-2 ">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
};

export default CustomReportsPage;
