import React, { useRef, useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

const StatusFilterDropdown = ({
  selectedStatus,
  statusOptions,
  onChange,
  project,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const dropdownRef = useRef(null);
  useEffect(() => {
    setSelectedStatuses([]);
  }, [project]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (status) => {
    setSelectedStatuses((prev) => {
      const isAlreadySelected = prev.includes(status.name);
      const updatedStatuses = isAlreadySelected
        ? prev.filter((s) => s !== status.name)
        : [...prev, status.name];
      onChange(updatedStatuses);
      return updatedStatuses;
    });
  };

  return (
    <div ref={dropdownRef} className="relative w-72">
      <button
        onClick={toggleDropdown}
        className={`w-full px-2 py-2 text-left bg-white rounded-lg hover:bg-gray-300 focus:outline-none flex items-center 
          ${isOpen ? "border-b-2 border-blue-500" : ""}`}
      >
        <span className="mr-1">
          {selectedStatuses.length > 0 ? selectedStatuses[0] : selectedStatus}
        </span>
        <RiArrowDropDownLine size={25} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="max-h-72 overflow-y-auto">
            {statusOptions && statusOptions.length > 0 ? (
              statusOptions.map((status, index) => (
                <li
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-all flex items-center"
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedStatuses.includes(status.name)}
                    onChange={() => handleCheckboxChange(status)}
                  />
                  {status.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No statuses available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StatusFilterDropdown;
