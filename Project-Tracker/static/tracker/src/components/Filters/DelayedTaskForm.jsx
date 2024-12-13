import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
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

const DelayedTaskForm = () => {
  const { projectStatuses, project } = useSelector((state) => state.filters);
  const { handleSubmit, register, watch, reset } = useForm();
  const dispatch = useDispatch();
  const [dateField, setDateField] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [assigneeNames, setAssigneeNames] = useState([]);

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const status = watch("status");
  const endDateStatus = watch("endDateStatus");

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
      dispatch(setIssuesFetched(true));
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

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSubmitForm)}
        className="flex flex-wrap items-center gap-2 w-full text-sm font-medium text-gray-800"
      >
        <AssigneeFilterDropdown
          options={assignees}
          onChange={handleAssigneeChange}
          project={project}
        />
        <div className="flex items-center justify-center mr-1">
          <span className="font-medium text-sm">FROM</span>
        </div>
        <div className="w-[115px]">
          <input
            id="startDate"
            {...register("startDate", {
              required: "Start Date is required",
            })}
            type="date"
            className=" w-full p-1.5 border rounded-lg focus:outline-none border-gray-300"
          />
        </div>
        <div className="flex items-center justify-center sm:w-1">
          <span className="font-medium text-sm">TO</span>
        </div>
        <div className="w-[115px]">
          <input
            id="endDate"
            {...register("endDate", { required: "End Date is required" })}
            type="date"
            className="w-full p-1.5 border rounded-lg focus:outline-none border-gray-300"
          />
        </div>
        <div className="w-32">
          <select
            id="status"
            {...register("status", { required: "Status is required" })}
            className="w-full p-2 focus:outline-none border-gray-300"
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
        <div className=" sm:w-32">
          <select
            id="endDateStatus"
            {...register("endDateStatus", {
              required: "End Date Status is required",
            })}
            className="w-full p-1.5  focus:outline-none "
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

        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 text-[13px] rounded-sm hover:bg-blue-700 disabled:bg-blue-500"
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
        <div className="relative group w-5">
          <IoInformationCircleOutline size={20} className="cursor-pointer" />
          <Tooltip
            text={`"Lookup Status" represents the status you want to verify, while "Lookup Date" is the field you want to compare it against. For example, if you select "Dev Completed" as the Lookup Status and "Dev End Date" as the Lookup Date, the report will show all tasks that transitioned to "Dev Completed" (within the selected date range) after the specified "Dev End Date."`}
          />
        </div>
      </form>
    </>
  );
};

export default DelayedTaskForm;
