import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import Avatar from "../shared/Avatar"; // Adjust the import path as needed

const AssigneeList = ({ options, onChange, project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssigneeClick = useCallback(
    (assignee) => {
      setSelectedAssignee((prev) => {
        const isSelected = prev?.accountId === assignee.accountId ? null : assignee;
        onChange(isSelected ? [isSelected] : []);
        return isSelected;
      });
      setIsOpen(false); // Close the dropdown after selection
    },
    [onChange]
  );

  useEffect(() => {
    clearSelection();
  }, [project]);

  const renderSelectedLabel = useMemo(() => {
    if (!selectedAssignee) return "Users";
    const name = selectedAssignee.displayName || "Unassigned";
    return name.length > 8 ? `${name.slice(0, 8)}...` : name;
  }, [selectedAssignee]);

  const clearSelection = () => {
    setSelectedAssignee(null);
    onChange([]);
  };

  return (
    <div ref={dropdownRef} className="relative text-sm font-semibold">
      <button
        onClick={toggleDropdown}
        className={`px-2 py-1 text-left bg-gray-200 rounded-sm hover:bg-gray-300 focus:outline-none flex items-center 
          ${isOpen ? "bg-blue-400 text-blue-400" : ""}`}
        type="button"
      >
        <span className="mr-1">{renderSelectedLabel}</span>
        <RiArrowDropDownLine size={20} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-[290px] bg-white border border-gray-300 rounded-sm">
          <ul className="max-h-72 overflow-y-auto">
            {options?.length > 0 ? (
              options.map((assignee) => (
                <li
                  key={assignee.accountId}
                  onClick={() => handleAssigneeClick(assignee)}
                  className={`px-2.5 py-2 cursor-pointer hover:bg-blue-50 transition-all flex items-center 
                    ${selectedAssignee?.accountId === assignee.accountId ? 'bg-blue-100' : ''}`}
                >
                  <Avatar assignee={assignee} />
                  <span className="ml-2 text-[13px] font-semibold text-gray-700">
                    {assignee.displayName || "Unassigned"}
                  </span>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">
                No assignees available
              </li>
            )}
          </ul>
          {options?.length > 0 && selectedAssignee && (
            <p
              onClick={clearSelection}
              className="px-4 py-2 text-red-500 hover:bg-red-50 cursor-pointer"
            >
              Clear Selection
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AssigneeList);