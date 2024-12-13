// import React, { useEffect, useState } from "react";
// import { invoke } from "@forge/bridge";
// import LoadingSpinner from "../LoadingSpinner";
// import ClientIssueTable from "./ClientIssueTable";
// import { useSelector } from "react-redux";
// import ProjectFilterWithCheckBox from "../Filters/ProjectFilterWithCheckBox";
// import StatusFilterDropdown from "../Filters/StatusFilter";

// const ClientWiseIssueList = () => {
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [generate, setGenerate] = useState(false);
//   const [project, setProject] = useState("");
//   const [statusOptions, setStatusOptions] = useState([]);
//   const [status, setStatus] = useState("");
//   const [selectedProjects, setSelectedProjects] = useState([]);
//   const { projects } = useSelector((state) => state.filters);

//   const fetchResults = async (project) => {
//     setIssues([]);
//     setLoading(true);
//     try {
//       const response = await invoke("applyClientWiseFilters", {
//         key: project,
//         status: status,
//       });
//       setIssues(response);
//     } catch (error) {
//       setError("Failed to fetch fields for the project.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchInitialProjects = async () => {
//     setLoading(true);
//     try {
//       const firstSixProjects = projects
//         .slice(0, 8)
//         .map((project) => `${project.key}:${project.name}`)
//         .join(",");
//       const response = await invoke("applyClientWiseFilters", {
//         key: firstSixProjects,
//       });
//       setIssues(response);
//     } catch (error) {
//       setError("Failed to fetch initial project data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStatusOptions = async (selectedProject) => {
//     try {
//       const response = await invoke("getProjectStatus", {
//         key: selectedProject.key,
//       });
//       setStatusOptions(response.statuses || []);
//     } catch (error) {
//       setError("Failed to fetch status options for the selected project.");
//     }
//   };

//   if (!projects) {
//     return <LoadingSpinner />;
//   }

//   useEffect(() => {
//     if (projects) {
//       fetchInitialProjects();
//     }
//   }, [projects]);

//   const handleChange = () => {
//     setGenerate(true);
//   };

//   useEffect(() => {
//     if (generate && project) {
//       fetchResults(project);
//       setGenerate(false);
//     }
//   }, [generate, project]);

//   const handleProjectChange = (selectedProjects) => {
//     setSelectedProjects(selectedProjects);
//     const projectsString = selectedProjects
//       .map((project) => `${project.key}:${project.name}`)
//       .join(",");
//     setProject(projectsString);
//     if (selectedProjects.length === 1) {
//       fetchStatusOptions(selectedProjects[0]);
//     } else {
//       setStatusOptions([]);
//     }
//   };

//   const handleStatusChange = (statuses) => {
//     setStatus(statuses.join(","));
//   };

//   return (
//     <main className="p-4">
//       <section className="filters flex flex-wrap gap-4 mb-6">
//         <ProjectFilterWithCheckBox
//           selectedProjects={"Select a Project"}
//           projectOptions={projects}
//           onChange={handleProjectChange}
//         />
//         {selectedProjects.length === 1 && (
//           <StatusFilterDropdown
//             selectedStatus={"Lookup Status"}
//             statusOptions={statusOptions}
//             onChange={handleStatusChange}
//             project={project}
//           />
//         )}
//         {project && (
//           <button
//             onClick={handleChange}
//             className="bg-blue-600 text-white px-2 py-1 text-[13px] rounded-sm hover:bg-blue-700 disabled:bg-blue-500"
//             disabled={loading}
//           >
//             Generate
//           </button>
//         )}
//       </section>
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {loading ? <LoadingSpinner /> : <ClientIssueTable issues={issues} />}
//     </main>
//   );
// };

// export default ClientWiseIssueList;
import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import LoadingSpinner from "../LoadingSpinner";
import ClientIssueTable from "./ClientIssueTable";
import { useSelector } from "react-redux";
import ProjectFilterWithCheckBox from "../Filters/ProjectFilterWithCheckBox";
import StatusFilterDropdown from "../Filters/StatusFilter";

const ClientWiseIssueList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generate, setGenerate] = useState(false);
  const [project, setProject] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const { projects } = useSelector((state) => state.filters);
  const [data, setData] = useState(false);

  const projectsPerPage = 8;

  const fetchResults = async (project) => {
    setData(true)
    setIssues([]);
    setLoading(true);
    try {
      const response = await invoke("applyClientWiseFilters", {
        key: project,
        status: status,
      });
      setIssues(response);
    } catch (error) {
      setError("Failed to fetch fields for the project.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialProjects = async (page = 1) => {
    setData(false)
    setLoading(true);
    try {
      const firstSetProjects = projects
        .slice((page - 1) * projectsPerPage, page * projectsPerPage)
        .map((project) => `${project.key}:${project.name}`)
        .join(",");
      const response = await invoke("applyClientWiseFilters", {
        key: firstSetProjects,
      });
      setIssues(response);
      setTotalProjects(projects.length);
    } catch (error) {
      setError("Failed to fetch ");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusOptions = async (selectedProject) => {
    try {
      const response = await invoke("getProjectStatus", {
        key: selectedProject.key,
      });
      setStatusOptions(response.statuses || []);
    } catch (error) {
      setError("Failed to fetch status options for the selected project.");
    }
  };

  if (!projects) {
    return <LoadingSpinner />;
  }

  useEffect(() => {
    if (projects) {
      fetchInitialProjects(currentPage);
    }
  }, [projects, currentPage]);

  const handleChange = () => {
    setGenerate(true);
  };

  useEffect(() => {
    if (generate && project) {
      fetchResults(project);
      setGenerate(false);
      setCurrentPage(1);
    }
  }, [generate, project]);

  const handleProjectChange = (selectedProjects) => {
    setSelectedProjects(selectedProjects);
    const projectsString = selectedProjects
      .map((project) => `${project.key}:${project.name}`)
      .join(",");
    setProject(projectsString);
    if (selectedProjects.length === 1) {
      fetchStatusOptions(selectedProjects[0]);
    } else {
      setStatusOptions([]);
    }
  };

  const handleStatusChange = (statuses) => {
    setStatus(statuses.join(","));
  };

  const handleNextPage = () => {
    if (currentPage * projectsPerPage < totalProjects) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(totalProjects / projectsPerPage);

  const getPaginationPages = () => {
    const pageNumbers = [];
    const range = 2;
    const startPage = Math.max(currentPage - range, 1);
    const endPage = Math.min(currentPage + range, totalPages);
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push("...");
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <main className="p-4">
      <section className="filters flex flex-wrap gap-4 mb-6">
        <ProjectFilterWithCheckBox
          selectedProjects={"Select a Project"}
          projectOptions={projects}
          onChange={handleProjectChange}
        />
        {selectedProjects.length === 1 && (
          <StatusFilterDropdown
            selectedStatus={"Lookup Status"}
            statusOptions={statusOptions}
            onChange={handleStatusChange}
            project={project}
          />
        )}
        {project && (
          <button
            onClick={handleChange}
            className="bg-blue-600 text-white px-2 py-1 text-[13px] rounded-sm hover:bg-blue-700 disabled:bg-blue-500"
            disabled={loading}
          >
            Generate
          </button>
        )}
      </section>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? <LoadingSpinner /> : <ClientIssueTable issues={issues} status={status}/>}

      {!loading && !data && issues && Object.entries(issues).length > 0 && (
        <section className="pagination mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrevPage}
              className="bg-gray-200 text-gray-700 px-3 text-xs font-bold py-1 rounded-sm hover:bg-gray-300"
              disabled={currentPage === 1 || loading}
            >
              &lt;
            </button>
            {getPaginationPages().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={index}
                    className="px-3 text-xs py-1 font-bold text-gray-700"
                  >
                    ...
                  </span>
                );
              } else {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`px-3 text-xs py-1 rounded-sm font-bold ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    } hover:bg-gray-300`}
                  >
                    {page}
                  </button>
                );
              }
            })}

            <button
              onClick={handleNextPage}
              className="bg-gray-200 text-gray-700 font-bold px-3 text-xs py-1 rounded-sm hover:bg-gray-300"
              disabled={
                currentPage * projectsPerPage >= totalProjects || loading
              }
            >
              &gt;
            </button>
          </div>
        </section>
      )}
    </main>
  );
};

export default ClientWiseIssueList;
