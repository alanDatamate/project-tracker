import React, { useRef, useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  setSeletedAssignees,
  setProjectStatuses,
  setStatus,
} from "../../redux/reducers/filterSlice";
import LoadingSpinner from "../LoadingSpinner";

const CustomDropdown = ({ option, options, onChange, disableDispatch }) => {
  const { project } = useSelector((state) => state.filters);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (options && options.length === 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [options]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const filteredOptions =
    options &&
    options.length > 0 &&
    options?.filter((option) =>
      option?.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

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

  const handleOptionClick = (option) => {
    setIsOpen(false);
    onChange(option?.key);
    setSelectedProject(option?.name);
    if (!disableDispatch) {
      dispatch(setStatus("All"));
      dispatch(setSeletedAssignees([]));
      dispatch(setProjectStatuses([]));
    }
  };

  useEffect(() => {
    if (project == "All") {
      setSelectedProject("");
    }
  }, [project]);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${selectedProject ? " w-72" : ""}`}
    >
      <button
        onClick={toggleDropdown}
        className={`w-full py-1 text-left bg-white rounded-lg ${
          selectedProject ? "" : "hover:bg-gray-300"
        } focus:outline-none flex items-center 
          ${isOpen ? "border-b-2 border-blue-500" : ""}`}
      >
        <span
          className={`flex items-center rounded-lg p-1 ${
            selectedProject ? "bg-blue-100 hover:bg-white " : ""
          }`}
        >
          {selectedProject ? (
            <>
              <span className={"text-blue-600 text-sm font-bold "}>
                Project :
                <span className="text-blue-500 text-sm font-[600]">
                  {" "}
                  &nbsp;
                  {selectedProject.length > 14
                    ? selectedProject.slice(0, 14)
                    : selectedProject}
                </span>
              </span>
            </>
          ) : (
            <span className="text-gray-900 text-base font-semibold">
              {option}
            </span>
          )}
          <RiArrowDropDownLine size={25} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 left-0 w-[20rem] bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {loading ? (
              <>
                <LoadingSpinner/>
              </>
            ) : filteredOptions && filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-all"
                  onClick={() => handleOptionClick(option)}
                >
                  {option.name}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
