import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const ResourceWiseCalendar = () => {
  // Dummy task data with busy ranges
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

  // Unique list of assignees
  const assignees = [...new Set(dummyTasks.map((task) => task.assignee))];

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

  return (
    <div className="p-4 bg-gray-100">
      <h2 className="mb-4">Resource-Wise Calendar</h2>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Assignee:</label>
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          style={{ marginRight: "20px" }}
        >
          <option value="">Select Assignee</option>
          {assignees.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <label style={{ marginRight: "10px" }}>Date Field:</label>
        <select
          value={dateField}
          onChange={(e) => setDateField(e.target.value)}
          style={{ marginRight: "20px" }}
        >
          <option value="dev">Dev Dates</option>
          <option value="qa">QA Dates</option>
        </select>

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

        <button onClick={handleGenerate} style={{ padding: "5px 10px" }}>
          Generate
        </button>
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={[]} // No need for actual events, we color the columns
        startAccessor="start"
        endAccessor="end"
        style={{ height: "500px" }}
        dayPropGetter={dayPropGetter} // Custom styling for day columns
      />
    </div>
  );
};

export default ResourceWiseCalendar;
