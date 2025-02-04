import { invoke } from '@forge/bridge';
import React, { useCallback, useEffect, useState } from 'react';
import CustomDropdown from '../Filters/CustomDropdown';
import { useSelector } from 'react-redux';
import Loading from '../Loading';
import { router } from "@forge/bridge";
import { LuUserCircle2 } from 'react-icons/lu';
import Avatar from '../shared/Avatar';
import StatusFilterDropdown from '../Filters/StatusFilter';
import AssigneeFilterDropdown from '../Filters/AssigneeFilter';
import { RiSpectrumFill } from 'react-icons/ri';

const FetchPendingTasksForDevelopers = () => {
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const filters = useSelector((state) => state.filters);
    const [projectStatus, setProjectStatus] = useState([]);
    const [selectedStartDateField, setSelectedStartDateField] = useState('');
    const [selectedEndDateField, setSelectedEndDateField] = useState('');
    const [loading, setLoading] = useState(false);
    const [customFields, setCustomFields] = useState([]);
    const [endDateCustomFields, setEndDateCustomFields] = useState([]);
    const [selectedUserField, setSelectedUserField] = useState('');
    const [showSelectedUserField, setShowSelectedUserField] = useState('');
    const [showSelectedStartDateField, setshowSelectedStartDateField] = useState('');
    const [showSelectedEndDateField, setshowSelectedEndDateField] = useState('');
    const [status, setStatus] = useState("");
    const [assignees, setAssignees] = useState([]);
    const [assigneeNames, setAssigneeNames] = useState([]);
    const [userCustomFields, setUserCustomFields] = useState([
        { "id": "customfield_10059", "name": "Developer" },
        { "id": "customfield_10063", "name": "Imp Assignee" },
        { "id": "customfield_10060", "name": "QA" }
    ]);
    const [showTable, setShowTable] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalIssues, setTotalIssues] = useState(0);
    const [startDate , setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const IssuesPerPage = 50;

    useEffect(() => {
        fetchCustomFields();
    }, [project]);

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

    const fetchCustomFields = async () => {
        if (!project) {
            setCustomFields([]);
            return;
        }
        try {
            const response = await invoke("getDateFieldForProject", { key: project });
            setCustomFields(response.formattedFields || []);
            setEndDateCustomFields(response.formattedFields || []);
            setProjectStatus(response.statuses || []);
        } catch (err) {
            console.error("Error fetching custom fields:", err);
        }
    };

    const generateTask = async (page = 1) => {
        if (!startDate && !endDate) {
            
        }else if(!startDate){
            alert("Please select From Date..");
            return;
        } else if (!endDate) {
            alert("Please select End Date..");
            return;
        } else if (new Date(startDate) > new Date(endDate)) {
            alert("Start Date cannot be later than End Date.");
            return;
        }
        
        setLoading(true);
        setShowTable(true);
        const selectedUserFieldName = selectedUserField ? userCustomFields.find((field) => field.id == selectedUserField) : null;
        if (selectedUserFieldName) {
            setShowSelectedUserField(selectedUserFieldName.id);
        }
        setshowSelectedStartDateField(selectedStartDateField);
        setshowSelectedEndDateField(selectedEndDateField);

        const startAt = (page - 1) * IssuesPerPage; // Calculate startAt dynamically based on the page
        try {
            const fetchedTasks = await invoke("FetchPendingTasksForDevelopers", {
                project,
                user: selectedUserFieldName,
                status,
                assigneeNames,
                startAt,
                maxResults: IssuesPerPage, 
                startDate,
                endDate,
                selectedStartDateField,
                selectedEndDateField
            });
            if (fetchedTasks && fetchedTasks.issues) {
                setTasks(fetchedTasks.issues);
                setTotalIssues(fetchedTasks.total); 
            } else {
                console.log('No tasks found.');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (statuses) => {
        setStatus(statuses.join(","));
    };

    const handleProjectChange = useCallback((selectedProject) => {
        setProject(selectedProject);
    }, []);

    const handleViewClick = (issueKey) => {
        const externalUrl = `https://datamate.atlassian.net/jira/software/projects/${project}/issues/${issueKey}`;
        router.open(externalUrl);
    };

    const handleAssigneeChange = (assignee) => {
        setAssigneeNames(assignee);
    };

    const handleNextPage = () => {
        if (currentPage * IssuesPerPage < totalIssues) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            generateTask(newPage);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            generateTask(newPage);
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        generateTask(pageNumber);
    };



    const totalPages = Math.ceil(totalIssues / IssuesPerPage);

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
   
    const handleStartDateChange = (e)=>{
        setStartDate(e.target.value)
    }
    const handleEndDateChange = (e)=>{
        setEndDate(e.target.value)
    }
    

    return (
        <>
            <nav className="flex gap-4 pb-3">
                <CustomDropdown
                    option="Select a Project"
                    options={filters.projects}
                    onChange={handleProjectChange}
                    disableDispatch={true}
                />
                {project && (
                    <>
                        <div >
                            <select
                                value={selectedStartDateField}
                                onChange={(e) => setSelectedStartDateField(e.target.value)}
                                className="text-sm font-bold px-2 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
                            >
                                <option value="">Scheduled Start Field</option>
                                {customFields && customFields.length > 0 && customFields.map((field) => (
                                    <option key={field.id} value={field.id}>
                                        {field.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div >
                            <select
                                value={selectedEndDateField}
                                onChange={(e) => setSelectedEndDateField(e.target.value)}
                                className="text-sm font-bold px-2 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
                            >
                                <option value="">Scheduled end Field</option>
                                {endDateCustomFields && endDateCustomFields.length > 0 && endDateCustomFields.map((field) => (
                                    <option key={field.id} value={field.id}>
                                        {field.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                       
                        <div >
                            <input
                            className="text-sm font-bold px-2 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
                                type='date'
                                onChange={handleStartDateChange}
                            />
                        </div>
                        <div >
                        <input
                            className="text-sm font-bold px-2 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
                                type='date'
                                onChange={handleEndDateChange}
                            />
                        </div>
                        <StatusFilterDropdown
                            selectedStatus={"Lookup Status"}
                            statusOptions={projectStatus}
                            onChange={handleStatusChange}
                            project={project}
                        />
                        {project == "HBM" && (
                            <div className='flex gap-2'>
                                <select
                                    value={selectedUserField}
                                    onChange={(e) => setSelectedUserField(e.target.value)}
                                    className="text-sm font-bold px-2 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
                                >
                                    <option value="">Select a user field</option>
                                    {userCustomFields && userCustomFields.length > 0 && userCustomFields.map((field) => (
                                        <option key={field.id} value={field.id}>
                                            {field.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            {selectedUserField && (
                                <AssigneeFilterDropdown
                                    options={assignees}
                                    onChange={handleAssigneeChange}
                                    project={project}
                                />
                            )}
                        </div>

                        <button
                            className="text-sm bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-sm text-white"
                            onClick={generateTask}
                        >
                            Generate
                        </button>
                    </>
                )}

            </nav>
            <div className="overflow-x-auto max-w-full overflow-y-auto max-h-[500px] custom-scrollbar">
                {!loading ? (
                    showTable && (
                        <table className="table table-xs table-pin-rows table-pin-cols min-w-[1700px]">
                            <thead>
                                <tr >
                                    <th className="w-28 border-r-2">Key</th>
                                    <td className="w-72">Summary</td>
                                    <td className="w-72">Assignee</td>
                                    {showSelectedUserField && (
                                        <td className="w-64">{userCustomFields.find(field => field.id === showSelectedUserField)?.name}</td>
                                    )}
                                    {customFields.filter((field) => field.id == showSelectedStartDateField).map((field) => (
                                        <td key={field.id} className="w-64">{field.name}</td>
                                    ))}
                                    {endDateCustomFields.filter((field) => field.id == showSelectedEndDateField).map((field) => (
                                        <td key={field.id} className="w-64">{field.name}</td>
                                    ))}
                                    <td className="w-44">Current Status</td>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks && tasks.length > 0 ? (
                                    tasks.map((task) => {
                                        const { fields } = task;
                                        return (
                                            <tr key={task.id} className="border-b hover:bg-gray-50 text-xs font-semibold">
                                                <th className="border-r-2 text-blue-500 underline cursor-pointer" onClick={() => handleViewClick(task.key)}>{task.key}</th>
                                                <td className="cursor-pointer"
                                                    title={fields.summary}>
                                                    {fields.summary.length > 30
                                                        ? `${fields.summary.slice(0, 30)}...`
                                                        : fields.summary}
                                                </td>
                                                <td>
                                                    <div className="flex items-center">
                                                        {fields?.assignee ? (
                                                            <>
                                                                <Avatar assignee={fields.assignee} />
                                                                {fields.assignee.displayName}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LuUserCircle2 className="w-6 h-6 rounded-full mr-2" />
                                                                {"Unassigned"}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                {showSelectedUserField && (
                                                    <td>
                                                        <div className="flex items-center">
                                                            {fields?.[showSelectedUserField] ? (
                                                                <>
                                                                    <Avatar assignee={fields?.[showSelectedUserField]?.[0]} />
                                                                    {fields?.[showSelectedUserField]?.[0].displayName}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <LuUserCircle2 className="w-6 h-6 rounded-full mr-2" />
                                                                    {"Unassigned"}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                                {customFields.filter((field) => field.id == showSelectedStartDateField).map((field) => (
                                                    <td key={field.id} >
                                                        {fields[field.id] || '--'}
                                                    </td>
                                                ))}
                                                {endDateCustomFields.filter((field) => field.id == showSelectedEndDateField).map((field) => (
                                                    <td key={field.id} >
                                                        {fields[field.id] || '--'}
                                                    </td>
                                                ))}
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`py-1 px-3 rounded-full text-xs ${task.fields.status.name === 'In Progress'
                                                            ? 'bg-yellow-200 text-yellow-800'
                                                            : task.fields.status.name === 'To Do'
                                                                ? 'bg-blue-200 text-blue-800'
                                                                : 'bg-green-200 text-green-800'}`}
                                                    >
                                                        {task.fields.status.name}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-3 px-4">
                                            No tasks available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    )
                ) : (
                    <Loading />
                )}
                
            </div>
            {tasks && tasks.length > 49 && (
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
                                            onClick={() => handlePageClick(page)} // Trigger data fetch when clicking a page
                                            className={`px-3 text-xs py-1 rounded-sm font-bold ${currentPage === page
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
                                disabled={currentPage * IssuesPerPage >= totalIssues || loading}
                            >
                                &gt;
                            </button>
                        </div>
                    </section>
                )}
        </>
    );
};

export default FetchPendingTasksForDevelopers;
