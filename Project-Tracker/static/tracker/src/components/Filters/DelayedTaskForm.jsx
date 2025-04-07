import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  fetchConflictingIssues,
  setIssues,
  setSelectedStatusName,
} from "../../redux/reducers/issuesSlice";
import { invoke } from "@forge/bridge";
import { IoInformationCircleOutline } from "react-icons/io5";
import Tooltip from "../shared/Tooltip";
import {
  setEndDate,
  setIssuesFetched,
  setProject,
  setProjectStatuses,
  setSeletedAssignees,
  setStartDate,
  setStatus,
} from "../../redux/reducers/filterSlice";
import AssigneeFilterDropdown from "./AssigneeFilter";
import { setSelectedField } from "../../redux/reducers/fieldSlice";

const DelayedTaskForm = () => {
  const { projectStatuses, project } = useSelector((state) => state.filters);
  const { handleSubmit, register, watch, reset } = useForm();
  const dispatch = useDispatch();
  const [dateField, setDateField] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [assigneeNames, setAssigneeNames] = useState([]);
  const [showUserField, setShowUserField] = useState(false);
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const status = watch("status");
  const endDateStatus = watch("endDateStatus");
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
  const [selectedFields, setSelectedFields] = useState({});
  const isFormFilled = startDate || endDate || status || endDateStatus;

  useEffect(() => {
    if (project !== "All") {
      const getDateFieldForProject = async () => {
        try {
          const { formattedFields, statuses } = await invoke(
            "getDateFieldForProject",
            {
              key: project,
            }
          );
          setDateField(formattedFields);
          dispatch(setProjectStatuses(statuses));
        } catch (error) {
          console.log(error);
        }
      };
      getDateFieldForProject();
    }
  }, [project]);

  const handleSubmitForm = async (data) => {
    try {
      const [key, name] = data.endDateStatus.split(":");
      if (name) {
        dispatch(setSelectedStatusName(name));
      }
      dispatch(
        fetchConflictingIssues(
          0,
          50,
          project,
          data.status,
          data.startDate,
          data.endDate,
          name,
          key,
          assigneeNames
        )
      );
      dispatch(setSeletedAssignees(assigneeNames));
      dispatch(setStartDate(data.startDate));
      dispatch(setEndDate(data.endDate));
      dispatch(setStatus(data.status));
      dispatch(setStartDate(data.startDate));
      dispatch(setSelectedField(selectedFields));
      dispatch(setIssuesFetched(true));
      if (project !== "HBM") {
        dispatch(setSelectedField({}));
      }

    } catch (error) {
      console.error(error);
    }
  };
  const handleReset = () => {
    reset({
      startDate: "",
      endDate: "",
      status: "",
      endDateStatus: "",
    });
    dispatch(setSelectedStatusName(""));
    dispatch(setProject("All"));
    dispatch(setIssues([]));
    dispatch(setIssuesFetched(false));
  };

  const handleAssigneeChange = (assignee) => {
    setAssigneeNames(assignee);
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

  const handleFieldChange = (e) => {
    const { name, checked } = e.target;
    setSelectedFields((prevState) => ({
      ...prevState,
      [name]: checked,
    }));

    dispatch(setSelectedFields({
      ...selectedFields,
      [name]: checked,
    }));
  };

  const handleClickOutside = useCallback((event) => {
    if (event.target.closest('.dropdown-container') === null) {
      setShowUserField(false);
    }
  }, []);
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (

    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="flex flex-wrap items-center gap-2 w-full text-sm font-medium text-gray-800"
    >
      <AssigneeFilterDropdown
        options={assignees}
        onChange={handleAssigneeChange}
        project={project}
      />
      <div className="w-[115px]">
        <input
          id="startDate"
          {...register("startDate", {
            required: "Start Date is required",
          })}
          type="date"
          className=" w-full p-1 border rounded-lg focus:outline-none border-gray-300 border-b border-b-red-400 cursor-pointer"
        />
      </div>
      <div className="flex items-center justify-center p-0.5">
        <span className="font-medium text-sm">TO</span>
      </div>
      <div className="w-[120px]">
        <input
          id="endDate"
          {...register("endDate", { required: "End Date is required" })}
          type="date"
          className="w-full p-1 border rounded-lg focus:outline-none border-gray-300 border-b border-b-red-400 cursor-pointer"
        />
      </div>
      <div className="w-[120px]">
        <select
          id="status"
          {...register("status", { required: "Status is required" })}
          className="w-full p-1 focus:outline-none border-gray-300 border-b border-b-red-400 cursor-pointer"
        >
          <option value="">Lookup Status</option>
          {projectStatuses &&
            projectStatuses.map((status) => (
              <option key={status.name} value={status.name}>
                {status.name}
              </option>
            ))}
        </select>
      </div>
      <div className="w-[115px]">
        <select
          id="endDateStatus"
          {...register("endDateStatus", {
            required: "End Date Status is required",
          })}
          className="w-full p-1 focus:outline-none border-b border-b-red-400 cursor-pointer"
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
      {project == "HBM" && (
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowUserField((prev) => !prev)}
            className="text-sm font-bold px-3 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
            type="button"
            title={"Select the user fields you'd like to display"}
          >
            <span className="flex items-center text-gray-700">Select Fields <MdKeyboardArrowDown /></span>
          </button>
          {showUserField && (
            <div className="absolute right-0 z-30 mt-2 w-48 bg-white border rounded-lg shadow-lg p-3 max-h-40 overflow-y-auto">
              <div>
                {customFields && customFields.length > 0 && customFields.map((field) => (
                  <label key={field.id} className="flex items-center mb-2 text-sm">
                    <input
                      type="checkbox"
                      name={field.id}
                      checked={selectedFields[field.id] || false}
                      onChange={handleFieldChange}
                      className="mr-2 w-4 h-4"
                    />
                    {field.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      <button
        type="submit"
        className="bg-blue-600 text-white px-3 py-1 text-[13px] rounded-sm hover:bg-blue-600 disabled:bg-blue-400"
        disabled={!isFormFilled}
      >
        Generate
      </button>
      {isFormFilled && (
        <div>
          <button
            type="button"
            className="text-gray-700 text-sm font-medium"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      )}
      <div className="relative group w-2">
        <IoInformationCircleOutline size={20} className="cursor-pointer"
          title={`"Lookup Status" represents the status you want to verify, while "Lookup Date" is the field you want to compare it against. For example, if you select "Dev Completed" as the Lookup Status and "Dev End Date" as the Lookup Date, the report will show all tasks that transitioned to "Dev Completed" (within the selected date range) after the specified "Dev End Date."`} />
      </div>
    </form>

  );
};

export default DelayedTaskForm;
