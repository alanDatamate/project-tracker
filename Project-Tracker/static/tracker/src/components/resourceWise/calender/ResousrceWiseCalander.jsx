import React, { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import CustomDropdown from "../../Filters/CustomDropdown";
import { useSelector } from "react-redux";
import { invoke } from "@forge/bridge";
import CalendarComponent from "./CalendarComponent";
import AssigneList from "../../Filters/AssigneList";


const ResourceWiseCalendar = () => {
  const { projects } = useSelector((state) => state.filters);
  const handleProjectChange = (value) => {
    setProject(value)
  };

  const [assignee, setAssignee] = useState("");
  const [dateField, setDateField] = useState([]); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [busyRanges, setBusyRanges] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [project, setProject] = useState("");
  const [selectedField, setSelectedField] = useState(null);

  const handleGenerate = async() => {
    if (!assignee || !startDate || !endDate || !project || !selectedField) {
      alert("Please fill fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
      const { filteredIssues } = await invoke("getAssigneesTaskScheduledList", {
        project,
        startDate: start,
        endDate: end,
        assignee,
        selectedField
      });
      setBusyRanges(filteredIssues);
      console.log(busyRanges)
      console.log(filteredIssues)
    } catch (error) {
      console.log(error)
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
      getDateFieldForProject();
    }
  }, [project]);

  const getDateFieldForProject = async () => {
    try {
      const { formattedFields } = await invoke(
        "getDateFieldForProject",
        {
          key: project,
        }
      );
      setDateField(formattedFields);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChange = (e) => {
    const [id, name] = e.target.value.split(':'); 
    setSelectedField({id, name}); 
  };
  

  const handleAssigneeChange = (assignee) => {
    setAssignee(assignee)
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
        <AssigneList
          options={assignees}
          onChange={handleAssigneeChange}
          project={project}
        />
        <div className="w-[115px]">
        <select
            className="w-full p-1  focus:outline-none "
            onChange={handleChange}
        >
          <option value="">Lookup Date</option>
          {dateField &&
            dateField.length > 0 &&
            dateField.map((field) => (
              <option key={field.id} value={`${field.id}:${field.name}`}>
                {field.name}
              </option>
            ))}
        </select>
      </div>
        
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
      <CalendarComponent events={busyRanges}/>
    </>
  );
};

export default ResourceWiseCalendar;
