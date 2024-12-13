import React from "react";
import LoggedTimeCell from "../TimeCell";
import NoTasksFound from "../shared/NoTasksFound";
import { router } from "@forge/bridge";

const ClientIssueTable = ({ issues, status }) => {
  if (!issues && Object.entries(issues).length > 0) {
    return <NoTasksFound desc={"datas"} />;
  }
  const openNavigatePage = (projectKey, status) => {
    const statusFilter = status
      ? `AND status in (${status
          .split(",")
          .map((s) => `"${s.trim()}"`)
          .join(",")})`
      : "";
    router.open(`/issues/?jql=project=${projectKey} ${statusFilter}`);
  };

  return (
    <div className="shadow border border-gray-200 rounded-lg">
      <div className="overflow-y-auto max-h-[500px]">
        <table className="min-w-full table-auto overflow-x-auto max-h-[500px] overflow-y-auto">
          <thead className="bg-blue-50 text-blue-600 text-sm font-medium">
            <tr>
              <th className="px-3 py-2 text-left">Project Name</th>
              <th className="px-3 py-2 text-left">Total Original Estimate</th>
              <th className="px-3 py-2 text-left">Total Time Spent</th>
              <th className="px-3 py-2 text-left">Remaining Estimate</th>
              <th className="px-3 py-2 text-left">Last Due Date</th>
              <th className="px-3 py-2 text-left"></th>
            </tr>
          </thead>

          <tbody className="text-gray-700 text-sm">
            {Object.entries(issues).map(([projectKey, project]) => (
              <tr
                key={projectKey}
                className="border-b hover:bg-gray-100 transition-all"
              >
                <td className="px-3 py-2 font-bold">
                  {" "}
                  <div className="flex items-center space-x-2">
                    <img
                      src={project.projectAvatarUrl}
                      alt={project.projectName}
                      className="w-4 h-4 object-cover"
                    />
                    <span>{project.projectName}</span>
                  </div>
                </td>
                <td className="px-3 py-2 hidden lg:table-cell">
                  {project.aggregatetimeoriginalestimate !== 0 ? (
                    <LoggedTimeCell
                      aggregatetimespent={project.aggregatetimeoriginalestimate}
                    />
                  ) : (
                    <p>-</p>
                  )}
                </td>
                <td className="px-3 py-2">
                  {project.timespent !== 0 ? (
                    <LoggedTimeCell aggregatetimespent={project.timespent} />
                  ) : (
                    <p>--</p>
                  )}
                </td>
                <td className="px-3 py-2">
                  {project.timespent !== 0 &&
                  project.aggregatetimeoriginalestimate !== 0 ? (
                    <LoggedTimeCell
                      aggregatetimespent={
                        project.aggregatetimeoriginalestimate -
                        project.timespent
                      }
                    />
                  ) : (
                    <p>--</p>
                  )}
                </td>
                <td className="px-3 py-2">
                  {project.lastTaskDueDate ? project.lastTaskDueDate : "--"}
                </td>
                <td
                  className="px-3 py-2 font-bold underline text-blue-500 text-xs cursor-pointer"
                  onClick={() => openNavigatePage(projectKey, status)}
                >
                  view
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientIssueTable;