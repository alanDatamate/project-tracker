import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CustomDropdown from "../../Filters/CustomDropdown";
import { useSelector } from "react-redux";
import { invoke } from "@forge/bridge";
import AssigneeFilterDropdown from "../../Filters/AssigneeFilter";


const localizer = momentLocalizer(moment);

const ResourceWiseCalendar = () => {
  const { projects } = useSelector((state) => state.filters);
  const handleProjectChange = (value) => {
    setProject(value)
  };
  const dummyTasks = [
    {
      id: 1,
      title: "Dev Task 1",
      assignee: "John Doe",
      devStart: new Date("2025-02-01"), // 1 Feb 2025
      devEnd: new Date("2025-02-07"),   // 7 Feb 2025
    },
    {
      id: 2,
      title: "QA Task 1",
      assignee: "John Doe",
      qaStart: new Date("2025-02-10"), // 10 Feb 2025
      qaEnd: new Date("2025-02-12"),   // 12 Feb 2025
    },
    {
      id: 3,
      title: "Dev Task 2",
      assignee: "Jane Smith",
      devStart: new Date("2025-02-15"), // 15 Feb 2025
      devEnd: new Date("2025-02-20"),   // 20 Feb 2025
    },
  ];

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
    const filteredTasks = dummyTasks.filter((task) => {
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
    <div className="p-4 bg-gray-100">
      <div className="mb-[20px] flex">
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

        <label style={{ marginRight: "10px" }}>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: "20px" }}
        />

        <label style={{ marginRight: "10px" }}>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: "20px" }}
        />

        <button onClick={handleGenerate} className="px-3 py-2 bg-green-600 hover:bg-green-700">
          Generate
        </button>
      </div>
      <Calendar
        localizer={localizer}
        events={[]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "500px" }}
        dayPropGetter={dayPropGetter}
      />
    </div>
  );
};

export default ResourceWiseCalendar;
