import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { LuUserCircle2 } from "react-icons/lu";
import { RiArrowDropDownLine } from "react-icons/ri";
import Avatar from "../shared/Avatar";

const AssigneeFilterDropdown = ({ options, onChange, project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
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

  const handleCheckboxChange = useCallback(
    (assignee) => {
      setSelectedAssignees((prev) => {
        const isSelected = prev.some((a) => a.accountId === assignee.accountId);
        const updated = isSelected
          ? prev.filter((a) => a.accountId !== assignee.accountId)
          : [
              ...prev,
              {
                accountId: assignee.accountId,
                displayName: assignee.displayName,
              },
            ];
        onChange(updated);
        return updated;
      });
    },
    [onChange]
  );

  useEffect(() => {
    clearAllSelection();
  }, [project ]);

  const renderSelectedLabel = useMemo(() => {
    if (selectedAssignees.length === 0) return "Users";
    if (selectedAssignees.length === 1) {
      const name = selectedAssignees[0]?.displayName || "Unassigned";
      return name.length > 8 ? `${name.slice(0, 8)}...` : name;
    }
    const firstName = selectedAssignees[0]?.displayName || "Unassigned";
    const displayName =
      firstName.length > 8 ? `${firstName.slice(0, 8)}...` : firstName;
    return `+${selectedAssignees.length - 1} ${displayName}`;
  }, [selectedAssignees]);

  const clearAllSelection = () => {
    setSelectedAssignees([]);
    onChange([]);
  };
  return (
    <div ref={dropdownRef} className="relative w-32">
      <button
        onClick={toggleDropdown}
        className={`w-full px-2 py-2 text-left bg-white rounded-lg hover:bg-gray-100 focus:outline-none flex items-center ${
          isOpen ? "border-b-2 border-blue-500" : ""
        }`}
        type="button"
      >
        <LuUserCircle2 className="w-6 h-6 rounded-full mr-2" />
        <span
          className={`truncate ${
            selectedAssignees.length > 0 ? "font-semibold text-blue-600" : ""
          }`}
        >
          {renderSelectedLabel}
        </span>
        <RiArrowDropDownLine size={20} className="text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-[20rem] bg-white rounded-lg shadow-lg">
          <ul className="max-h-72 overflow-y-auto">
            {options?.length > 0 ? (
              options.map((assignee, index) => (
                <li
                  key={assignee.accountId}
                  className="px-4 py-2 flex items-center hover:bg-blue-50 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedAssignees.some(
                      (a) => a.accountId === assignee.accountId
                    )}
                    onChange={() => handleCheckboxChange(assignee)}
                    className="mr-2"
                  />
                  <Avatar key={index} assignee={assignee} />
                  <span className="ml-2">
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
          {options?.length > 0 && selectedAssignees.length > 0 && (
            <p
              onClick={clearAllSelection}
              className="px-4 py-2 text-red-500 hover:bg-red-50 cursor-pointer"
            >
              Clear All
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AssigneeFilterDropdown);
