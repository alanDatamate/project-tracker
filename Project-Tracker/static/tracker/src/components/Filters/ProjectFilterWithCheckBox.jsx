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
  const clearAllSelection = () => {
    setSlectedProjectslist([]);
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
        <span className="mr-1">{displayText}</span>
        <RiArrowDropDownLine size={20} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 left-0 w-[290px] bg-white border border-gray-300 rounded-sm">
          <div className="py-2 w-full">
            <input
              type="text"
              placeholder="Search Projects"
              className="w-full py-2 border-b-2 border-b-gray-300 rounded-xs placeholder:font-normal placeholder:pl-3"
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
                    className="px-2.5 py-2 cursor-pointer hover:bg-blue-50 transition-all flex items-center"
                  >
                    <input
                      type="checkbox"
                      className="mr-2 cursor-pointer"
                      checked={selectedProjectlist.some(
                        (p) => p.key === project.key
                      )}
                      onChange={() => handleCheckboxChange(project)}
                    />
                    <div className="flex items-center ">
                      <img
                         className="w-4 h-4 rounded-sm object-cover"
                        src={project?.avatarUrls?.["48x48"]}
                        alt={project?.name || "Project Avatar"}
                        loading="lazy"
                      />
                      <span className="ml-2 text-[13px] font-semibold text-gray-700">{project?.name || "Unnamed Project"}</span>
                    </div>

                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No projects found</li>
              )}
            </ul>
          )}
          {selectedProjectlist?.length > 0 && selectedProjectlist.length > 0 && (
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

export default ProjectFilterWithCheckBox;
