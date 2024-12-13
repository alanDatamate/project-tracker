import React from "react";
import { LuUserCircle2 } from "react-icons/lu";
import LoggedTimeCell from "./TimeCell";
import { useSelector } from "react-redux";
import { router } from "@forge/bridge";
import Avatar from "./shared/Avatar";

const IssueTable = ({ issues }) => {
  const { project } = useSelector((state) => state.filters);
  const { SelectedStatusName } = useSelector((state) => state.issues);
  const handleViewClick = (issueKey) => {
    const externalUrl = `https://datamate.atlassian.net/jira/software/projects/${project}/issues/${issueKey}`;
    router.open(externalUrl);
  };
  const handleImageError = (e) => {
    e.target.src =
      "https://th.bing.com/th/id/R.8e2c571ff125b3531705198a15d3103c?rik=muXZvm3dsoQqwg&riu=http%3a%2f%2fpluspng.com%2fimg-png%2fpng-user-icon-person-icon-png-people-person-user-icon-2240.png&ehk=MfHYkGonqy7I%2fGTKUAzUFpbYm9DhfXA9Q70oeFxWmH8%3d&risl=&pid=ImgRaw&r=0"; // Fallback image
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="overflow-y-auto max-h-[600px] relative">
        <table className="min-w-full table-auto overflow-x-auto max-h-[500px] overflow-y-auto ">
          <thead className="bg-blue-50 text-gray-600 text-xs font-medium sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Key</th>
              <th className="px-3 py-2 text-left">Summary</th>
              <th className="px-3 py-2 text-left">Assignee</th>
              <th className="px-3 py-2 text-left">Current Status</th>
              <th className="px-3 py-2 text-left hidden md:table-cell">
                Original Estimate
              </th>
              <th className="px-3 py-2 text-left hidden md:table-cell">
                Time Spent
              </th>
              {SelectedStatusName && (
                <>
                  <th className="px-3 py-2 text-left hidden lg:table-cell">
                    {SelectedStatusName ? SelectedStatusName : "End Date"}
                  </th>
                  <th className="px-3 py-2 text-left hidden lg:table-cell">
                    Status Updated Date
                  </th>
                </>
              )}
              <th className="px-3 py-2 text-left hidden lg:table-cell"></th>
            </tr>
          </thead>

          <tbody className="text-gray-700 text-[13px] ">
            {issues && issues.length > 0 ? (
              issues.map((issue, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-100 transition-all"
                >
                  <td className="px-3 py-1">{issue?.key}</td>
                  <td className="px-3 py-1">
                    <td className="px-3 py-1">
                      {issue.fields?.summary &&
                      issue.fields?.summary.length > 20
                        ? issue.fields?.summary.slice(0, 20) + "..."
                        : issue.fields?.summary}
                    </td>
                  </td>
                  <td className="px-3 py-1 flex items-center">
                    {issue.fields?.assignee ? (
                      <>
                     <Avatar key={index} assignee={issue.fields.assignee}/>

                        {issue.fields.assignee.displayName}
                      </>
                    ) : (
                      <>
                        <LuUserCircle2 className="w-6 h-6 rounded-full mr-2" />
                        {"Unassigned"}
                      </>
                    )}
                  </td>
                  <td className="px-3 py-1 font-semibold">
                    {issue.fields && issue.fields.status?.name
                      ? issue.fields.status.name
                      : issue.fields.currentStatus}
                  </td>
                  <td className="px-3 py-1 hidden md:table-cell">
                    <LoggedTimeCell
                      aggregatetimespent={
                        issue.fields?.aggregatetimeoriginalestimate
                      }
                    />
                  </td>
                  <td className="px-3 py-1 hidden md:table-cell">
                    <LoggedTimeCell
                      aggregatetimespent={issue.fields?.timespent}
                    />
                  </td>
                  {SelectedStatusName && (
                    <>
                      <td className="px-3 py-1 hidden lg:table-cell font-semibold">
                        {issue.fields?.EndDate
                          ? issue.fields.EndDate.split("T")[0]
                          : "N/A"}
                      </td>
                      <td className="px-3 py-1 hidden lg:table-cell font-semibold">
                        {issue.fields?.statusUpdatedDate
                          ? issue.fields.statusUpdatedDate.split("T")[0]
                          : "N/A"}
                      </td>
                    </>
                  )}
                  <td className="px-3 py-1 hidden lg:table-cell">
                    <button
                      className="underline text-xs text-blue-600 font-bold"
                      onClick={() => handleViewClick(issue.key)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  No issues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueTable;
