import React, { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CustomDropdown from "../../Filters/CustomDropdown";
import { useSelector } from "react-redux";
import { invoke } from "@forge/bridge";
import AssigneeFilterDropdown from "../../Filters/AssigneeFilter";
import CalendarComponent from "./CalendarComponent";


const ResourceWiseCalendar = () => {
  const { projects } = useSelector((state) => state.filters);
  const handleProjectChange = (value) => {
    setProject(value)
  };

  const [assignee, setAssignee] = useState("");
  const [dateField, setDateField] = useState("dev"); // Default to dev date
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [busyRanges, setBusyRanges] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [project, setProject] = useState("");


  // Function to filter tasks and set busy ranges
  const handleGenerate = () => {
    if (!assignee || !startDate || !endDate) {
      alert("Please fill all filters: Assignee, Start Date, and End Date.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter tasks based on assignee and selected date field
    const filteredTasks = [].filter((task) => {
      return (
        task.assignee === assignee &&
        task[`${dateField}Start`] <= end &&
        task[`${dateField}End`] >= start
      );
    });

    setBusyRanges(filteredTasks);
  };

  // Function to style day columns dynamically
  const dayPropGetter = (date) => {
    const isBusy = busyRanges.some(
      (range) => date >= range[`${dateField}Start`] && date <= range[`${dateField}End`]
    );

    if (isBusy) {
      return { style: { backgroundColor: "red", color: "white" } }; // Busy days
    } else {
      return { style: { backgroundColor: "lightblue" } }; // Free days
    }
  };
  useEffect(() => {
    if (project) {
      const getAssigneesForProject = async () => {
        try {
          const response = await invoke("getAssigneesForProject", {
            key: project,
          });
          setAssignees(response.assignees);
        } catch (error) {
          console.log(error);
        }
      };
      getAssigneesForProject();
    }
  }, [project]);

  const handleAssigneeChange = (assignee) => {

  };

  return (
    <>
      <div className="mb-2 flex gap-2">
        <CustomDropdown
          option={"Project"}
          options={projects}
          onChange={handleProjectChange}
          disableDispatch={true}
        />
        <AssigneeFilterDropdown
          options={assignees}
          onChange={handleAssigneeChange}
          project={project}
        />
        
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md p-1 text-sm"
        />
        <label className="m-0.5">TO</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mr-4 rounded-md p-1 text-sm"
        />
        <button onClick={handleGenerate} className="px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-sm text-white">
          Generate
        </button>
      </div>
      <CalendarComponent events={[]}/>
    </>
  );
};

export default ResourceWiseCalendar;
