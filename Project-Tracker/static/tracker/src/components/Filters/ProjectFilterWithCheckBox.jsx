import React, { useRef, useState, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import LoadingSpinner from "../LoadingSpinner";

const ProjectFilterWithCheckBox = ({
  selectedProjects,
  projectOptions,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectlist, setSlectedProjectslist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    if (projectOptions && projectOptions.length === 0) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [projectOptions]);

  const handleCheckboxChange = (project) => {
    setSlectedProjectslist((prev) => {
      const isAlreadySelected = prev.some((p) => p.key === project.key);
      const updatedProjects = isAlreadySelected
        ? prev.filter((p) => p.key !== project.key)
        : [...prev, project];
      onChange(updatedProjects);
      return updatedProjects;
    });
  };

  const displayText =
    selectedProjectlist.length > 0
      ? `${selectedProjectlist[0].name} (+${selectedProjectlist.length - 1})`
      : selectedProjects;

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const filteredProjects = projectOptions.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative w-72">
      <button
        onClick={toggleDropdown}
        className={`w-full px-2 py-2 text-left bg-white rounded-lg hover:bg-gray-300 focus:outline-none flex items-center 
          ${isOpen ? "border-b-2 border-blue-500" : ""}`}
      >
        <span className="mr-1">{displayText}</span>
        <RiArrowDropDownLine size={25} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Search Projects"
              className="w-full px-4 py-2 border border-gray-300 rounded"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {loading || isSearching ? (
            <LoadingSpinner />
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-all flex items-center"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedProjectlist.some(
                        (p) => p.key === project.key
                      )}
                      onChange={() => handleCheckboxChange(project)}
                    />
                    {project.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No projects found</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectFilterWithCheckBox;
