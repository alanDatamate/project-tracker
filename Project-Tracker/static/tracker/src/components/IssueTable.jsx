import React, { useState } from "react";
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

  const selectedFields = useSelector((state) => state.fields.selectedFields);
  const [customFields, setCustomFields] = useState([
    {
      "id": "customfield_10059",
      "name": "Developer"
    }, {
      "id": "customfield_10063",
      "name": "Imp Assignee"
    }, {
      "id": "customfield_10060",
      "name": "QA",
    }]);

  return (
    <div className="overflow-x-auto max-w-full overflow-y-auto max-h-[500px] custom-scrollbar">
      <table className="table table-xs table-pin-rows table-pin-cols min-w-[1600px]">
        <thead>
          <tr>
            <th className="w-28 border-r-2" >Key</th>
            <td className="w-80">Summary</td>
            <td className="w-64">Assignee</td>
            {Object.keys(selectedFields).map((fieldId) => {
              if (selectedFields[fieldId]) {
                const field = customFields.find((f) => f.id === fieldId);
                return (
                  <td className="w-64" key={field.id}>{field.name}</td>
                );
              }
              return null;
            })}
            <td className="w-44">Current Status</td>
            <td className="w-44">Original Estimate</td>
            <td className="w-44">Time Spent</td>
            {SelectedStatusName && (
              <>
                <td className="w-44">
                  {SelectedStatusName ? SelectedStatusName : "End Date"}
                </td>
                <td className="w-44">
                  Status Updated Date
                </td>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {issues && issues.length > 0 ? (
            issues.map((issue, index) => (
              <tr key={index}>

                <th className="border-r-2 underline text-xs text-blue-600 font-bold cursor-pointer"
                 onClick={() => handleViewClick(issue.key)}>{issue?.key}</th>
                <td title={issue.fields?.summary} className="cursor-pointer">
                  {issue.fields?.summary &&
                    issue.fields?.summary.length > 30
                    ? issue.fields?.summary.slice(0, 30) + "..."
                    : issue.fields?.summary}</td>
                <td >
                  <div className="flex items-center">

                    {issue.fields?.assignee ? (
                      <>
                        <Avatar key={index} assignee={issue.fields.assignee} />

                        {issue.fields.assignee.displayName}
                      </>
                    ) : (
                      <>
                        <LuUserCircle2 className="w-6 h-6 rounded-full mr-2" />
                        {"Unassigned"}
                      </>
                    )}
                  </div>
                </td>
                {Object.keys(selectedFields).map((fieldId) => {
                  if (selectedFields[fieldId]) {
                    return (
                      <td key={fieldId} >
                        <div className="flex items-center">

                          {issue.fields?.[fieldId] ? (
                            <>
                              <Avatar key={index} assignee={issue.fields?.[fieldId]} />

                              {issue.fields?.[fieldId]?.displayName}
                            </>
                          ) : (
                            <>
                              <LuUserCircle2 className="w-6 h-6 rounded-full mr-2" />
                              {"Unassigned"}
                            </>
                          )}
                        </div>
                      </td>
                    );
                  }
                  return null;
                })}
                <td>{issue.fields && issue.fields.status?.name
                  ? issue.fields.status.name
                  : issue.fields.currentStatus}</td>
                <td><LoggedTimeCell
                  aggregatetimespent={
                    issue.fields?.aggregatetimeoriginalestimate
                  } />
                </td>
                <td> <LoggedTimeCell
                  aggregatetimespent={issue.fields?.timespent}
                  highlight={issue.fields?.aggregatetimeoriginalestimate < issue.fields?.timespent ? "highlight" :""}
                />
                </td>
                {SelectedStatusName && (
                  <>
                    <td >
                      {issue.fields?.EndDate
                        ? issue.fields.EndDate.split("T")[0]
                        : "N/A"}
                    </td>
                    <td className="highlight">
                      {issue.fields?.statusUpdatedDate
                        ? issue.fields.statusUpdatedDate.split("T")[0]
                        : "N/A"}
                    </td>
                  </>
                )}
             
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


  );
};

export default IssueTable;
