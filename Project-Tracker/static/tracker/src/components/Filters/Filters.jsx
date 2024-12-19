import React from "react";
import CustomDropdown from "./CustomDropdown";
import { useFilters } from "../../hooks/useFilter";
import DelayedTaskForm from "./DelayedTaskForm";
const Filters = ({ project }) => {
  const { filters, handleProjectChange } = useFilters();

  return (
    <section className="flex gap-2 items-center mb-6 w-full">
      <CustomDropdown
        option={"Select a Project"}
        options={filters.projects}
        onChange={handleProjectChange}
        disableDispatch={true}
      />
      {project && project !== "All" && <DelayedTaskForm />}
    </section>
  );
};

export default Filters;
