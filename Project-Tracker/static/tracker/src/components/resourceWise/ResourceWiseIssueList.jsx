import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { invoke } from "@forge/bridge";
import ResourceWiseIssueTable from "./ResourceWiseIssueTable";
import LoadingSpinner from "../LoadingSpinner";
import CustomDropdown from "../Filters/CustomDropdown";
import StatusFilterDropdown from "../Filters/StatusFilter";

const ResourceWiseIssueList = () => {
  const { projects } = useSelector((state) => state.filters);
  const [project, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [startDates, setStartDates] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectStatuses, setProjectNameStatuses] = useState([]);
  const [status, setStatus] = useState("");

  const fetchEndDates = async () => {
    try {
      const response = await invoke("retrieveProjectDateFields", {
        key: project,
      });
      const projectResponse = await invoke("getProjectStatus", {
        key: project,
      });
      setStartDates(response.startDates);
      setProjectNameStatuses(projectResponse.statuses);
    } catch (error) {
      setError("Failed to fetch date fields for the selected project.");
    }
  };

  useEffect(() => {
    if (project) {
      setStartDates([]);
      setIssues([]);
      setStartDate("");
      setError(null);
      fetchEndDates();
      setStatus("")
    }
  }, [project]);

  const handleFilterChange = async () => {
    setError("")
    setLoading(true);
    if (!project || !selectedStartDate || !startDate ) {
      setError("All fields must be filled before applying filters.");
      return;
    }
    try {
      const [startDateName, startDateId] = selectedStartDate.split("|");
      const response = await invoke("applyResourcewiseFilters", {
        project,
        selectedStartDate: { startDateName, startDateId },
        startDate,
        status
      });
      setIssues(response.assignees);
    } catch (error) {
      console.log(error)
      setError("Failed to apply filters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (value) => {
    setProjectName(value);
  };

  const handleStatusChange = (statuses) => {
    setStatus(statuses.join(","));
  };

  return (
    <main className="p-4">
      <section className="filters flex flex-wrap gap-4 mb-6">
        <CustomDropdown
          option={"Projects"}
          options={projects}
          onChange={handleProjectChange}
          disableDispatch={false}
        />
        <div className="flex items-center">
          <label>FROM :</label>
        </div>
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 border rounded"
        />
        <select
          value={selectedStartDate}
          onChange={(e) => setSelectedStartDate(e.target.value)}
          className="px-3 "
        >
          <option value="">Lookup Date</option>
          {startDates &&
            startDates.length > 0 &&
            startDates.map((date) => (
              <option key={date.id} value={`${date.name}|${date.id}`}>
                {date.name}
              </option>
            ))}
        </select>
        <StatusFilterDropdown
          selectedStatus={"Lookup Status"}
          statusOptions={projectStatuses}
          onChange={handleStatusChange}
          project={project}
        />
        <button
          onClick={handleFilterChange}
          className="bg-blue-600 text-white px-3 py-1 text-[13px] rounded-sm hover:bg-blue-700 disabled:bg-blue-500"
          disabled={!selectedStartDate}
        >
          Generate
        </button>
      </section>
      {loading ? (
        <>
          {error && <p>{error}</p>}
          <LoadingSpinner />
        </>
      ) : (
        <ResourceWiseIssueTable issues={issues} project={project} />
      )}
    </main>
  );
};

export default ResourceWiseIssueList;
