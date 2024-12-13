import React from "react";
import NoTasksFound from "../shared/NoTasksFound";
import { FiAlertCircle } from "react-icons/fi";

const ResourceWiseTaskList = ({ issues, project }) => {
  if (!issues) {
    return;
  }
  return (
    <div>
      {project && issues.length === 0 ? (
        <NoTasksFound
          desc="Resource"
        />
      ) : (
        issues.length > 0 && (
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">Assignee</th>
                <th className="px-6 py-3 text-left">First Scheduled Date</th>
                <th className="px-6 py-3 text-left">Last Scheduled Date</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((assignee) => {
                return (
                  <tr key={assignee.assignee}>
                    <td className="border px-6 py-3">{assignee.assignee}</td>
                    <td className="border px-6 py-3">
                      {assignee.firstTaskStartDate.split("T")[0]}
                    </td>
                    <td className="border px-6 py-3">
                      {assignee.lastTaskEndDate.split("T")[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};

export default ResourceWiseTaskList;
