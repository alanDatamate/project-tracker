import React, { useEffect, useState } from "react";
import JiraIssueList from "./JiraIssueList";
import ClientIssueTable from "./clientWiseReport/ClientIssueList";
import ResourceWiseIssueList from "./resourceWise/ResourceWiseIssueList";
import { setProject } from "../redux/reducers/filterSlice";
import { useDispatch } from "react-redux";
import { setIssues } from "../redux/reducers/issuesSlice";

const CustomReportsPage = () => {
  const [activeTab, setActiveTab] = useState("dev-end-date");
  const dispatch = useDispatch();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dev-end-date":
        return <JiraIssueList />;
      case "client-wise":
        return <ClientIssueTable />;
      case "resource-wise":
        return <ResourceWiseIssueList />;
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
  useEffect(()=>{
   dispatch(setProject("All"))
   dispatch(setIssues([]))
  },[activeTab])

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-56 border-r border-gray-300 text-gray-700 font-sans p-6">
        <h1 className="px-3 text-lg font-semibold mb-4">Reports </h1>
        <div className="w-full border-t border-gray-300 mb-4" />
        <div className="space-y-2 text-sm">
          <button
            onClick={() => setActiveTab("dev-end-date")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${
              activeTab === "dev-end-date"
                ? "text-blue-600 font-semibold"
                : ""
            }`}
          >
            Delayed Tasks
          </button>
          <button
            onClick={() => setActiveTab("client-wise")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${
              activeTab === "client-wise"
                ? "text-blue-600 font-semibold"
                : ""
            }`}
          >
            ClientWise
          </button>
          <button
            onClick={() => setActiveTab("resource-wise")}
            className={`w-full text-left px-2 py-1 rounded-lg font-medium ${
              activeTab === "resource-wise"
                ?"text-blue-600 font-semibold"
                : ""
            }`}
          >
            ResourceWise
          </button>
        </div>
      </aside>
      <main className="flex-1 px-5 w-full">
        <div className="bg-white rounded-lg p-2 pt-5">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
};

export default CustomReportsPage;
