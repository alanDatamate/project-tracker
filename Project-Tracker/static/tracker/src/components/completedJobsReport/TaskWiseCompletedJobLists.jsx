import { invoke } from '@forge/bridge';
import React, { useCallback, useEffect, useState } from 'react';
import LoggedTimeCell from '../TimeCell';
import CustomDropdown from '../Filters/CustomDropdown';
import { useSelector } from 'react-redux';
import Loading from '../Loading';
import { router } from "@forge/bridge";
import { LuUserCircle2 } from 'react-icons/lu';
import Avatar from '../shared/Avatar';


const calculateVariation = (estimated, actual) => {
    if (estimated && actual && actual > estimated) {
        return `${Math.abs(((actual - estimated) / estimated) * 100).toFixed(2)}%`;
    }
    return "--";
};

const TaskWiseCompletedJobLists = () => {
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const filters = useSelector((state) => state.filters)
    const [loading, setLoading] = useState(false);
    const [customFields, setCustomFields] = useState([]);
    const [projectStatus, setProjectStatus] = useState([]);
    const [endDateCustomFields, setEndDateCustomFields] = useState([]);
    const [selectedUserField, setSelectedUserField] = useState('');
    const [selectedEndDateField, setSelectedEndDateField] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedActualEndStatus, setSelectedActualEndStatus] = useState('');
    const [selectedStartDateField, setSelectedStartDateField] = useState('');
    const [showSelectedUserField, setShowSelectedUserField] = useState('');
    const [showSelectedStartDateField, setshowSelectedStartDateField] = useState('');
    const [showSelectedEndDateField, setshowSelectedEndDateField] = useState('');
    const [showselectedActualEndStatusField, setSelectedActualEndStatusField] = useState('');
    const [showSelectedActualStartStatusField, setSelectedActualStartStatusField] = useState('');
    const [userCustomFields, setUserCustomFields] = useState([
        {
            "id": "customfield_10059",
            "name": "Developer"
        }, {
            "id": "customfield_10063",
            "name": "Imp Assignee"
        }, {
            "id": "customfield_10060",
            "name": "QA",
        }]);
    const [showTable, setShowTable] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalIssues, setTotalIssues] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const IssuesPerPage = 50;

    useEffect(() => {
        fetchCustomFields();
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
        
        if (!selectedEndDateField || !selectedStatus || !selectedStartDateField || !selectedActualEndStatus) {
            return
        }
        setLoading(true)
        setShowTable(true);
        const selectedUserFieldName = selectedUserField ? userCustomFields.find((field) => field.id == selectedUserField) : null;
        if (selectedUserFieldName) {
            setShowSelectedUserField(selectedUserFieldName.id)
        }
        setshowSelectedEndDateField(selectedEndDateField);
        setshowSelectedStartDateField(selectedStartDateField);
        setSelectedActualStartStatusField(selectedStatus)
        setSelectedActualEndStatusField(selectedActualEndStatus)
        const startAt = (page - 1) * IssuesPerPage;
        try {
            const fetchedTasks = await invoke("TaskWiseCompletedJobLists", {
                project, user: selectedUserFieldName, selectedEndDateField,
                selectedStatus, selectedStartDateField, selectedActualEndStatus,
                startAt,
                maxResults: IssuesPerPage,
                startDate,
                endDate
            });
            setTasks(fetchedTasks.issues);
            setTotalIssues(fetchedTasks.total);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    const handleProjectChange = useCallback((selectedProject) => {
        setProject(selectedProject);
    }, [])

    const handleViewClick = (issueKey) => {
        const externalUrl = `https://datamate.atlassian.net/jira/software/projects/${project}/issues/${issueKey}`;
        router.open(externalUrl);
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

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value)
    }
    const handleEndDateChange = (e) => {
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
                                className="text-sm font-bold px-3 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
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
                                className="text-sm font-bold px-3 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
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
                        <div >
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="text-sm font-bold px-3 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
                            >
                                <option value="">Actual Start</option>
                                {projectStatus &&
                                    projectStatus.map((status) => (
                                        <option key={status.name} value={status.name}>
                                            {status.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div >
                            <select
                                value={selectedActualEndStatus}
                                onChange={(e) => setSelectedActualEndStatus(e.target.value)}
                                className="text-sm font-bold px-3 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
                            >
                                <option value="">Actual End</option>
                                {projectStatus &&
                                    projectStatus.map((status) => (
                                        <option key={status.name} value={status.name}>
                                            {status.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        {project == "HBM" && (
                            <div>

                                <select
                                    value={selectedUserField}
                                    onChange={(e) => setSelectedUserField(e.target.value)}
                                    className="text-sm font-bold px-3 py-1 text-left rounded-lg focus:outline-none flex items-center w-full whitespace-nowrap cursor-pointer border-b border-b-gray-300"
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

                        <button
                            className="text-sm bg-blue-500 hover:bg-blue-600 p-1 text-white"
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
                        <table className="table table-xs table-pin-rows table-pin-cols min-w-[1800px]">
                            <thead>
                                <tr >
                                    <th className="w-36 border-r-2">Key</th>
                                    <td className="w-80">Summary</td>
                                    {showSelectedUserField ? (
                                        <td className="w-64">{userCustomFields.find(field => field.id === showSelectedUserField)?.name}</td>
                                    ) : (
                                        <td className="w-64">assignee</td>
                                    )}
                                    {customFields.filter((field) => field.id == showSelectedStartDateField).map((field) => (
                                        <td key={field.id} className="w-64">{field.name}</td>
                                    ))}
                                    {endDateCustomFields.filter((field) => field.id == showSelectedEndDateField).map((field) => (
                                        <td key={field.id} className="w-64">{field.name}</td>
                                    ))}
                                    <td className="w-44">Actual Start Updated Date</td>
                                    <td className="w-44">Actual End Updated Date</td>
                                    <td className="w-44">Estimated Time</td>
                                    <td className="w-44">Actual Time</td>
                                    <td className="w-44">Variation %</td>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks && tasks.length > 0 ? (
                                    tasks.map((task) => {
                                        const { fields } = task;
                                        const estimatedTime = fields.timeoriginalestimate || 0;
                                        const actualTime = fields.timespent || 0;
                                        return (
                                            <tr key={task.id} className="border-b hover:bg-gray-50 text-xs font-semibold">
                                                <th className="border-r-2 underline text-blue-600 cursor-pointer"
                                                onClick={() => handleViewClick(task.key)}>{task.key}</th>
                                                <td className="cursor-pointer"
                                                    title={fields.summary}>
                                                    {fields.summary.length > 30
                                                        ? `${fields.summary.slice(0, 30)}...`
                                                        : fields.summary}
                                                </td>
                                                {showSelectedUserField ? (
                                                    <td>
                                                        <div className="flex items-center">
                                                            {task.fields?.[showSelectedUserField] ? (
                                                                <>
                                                                    <Avatar assignee={task.fields?.[showSelectedUserField]?.[0]} />
                                                                    {task.fields?.[showSelectedUserField]?.[0].displayName}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <LuUserCircle2 className="w-6 h-6 rounded-full mr-2" />
                                                                    {"Unassigned"}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                ) : (
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
                                                {showSelectedActualStartStatusField && (
                                                    <td key={showSelectedActualStartStatusField}
                                                        className={
                                                            fields[showSelectedEndDateField] && 
                                                        task[showSelectedActualStartStatusField] && 
                                                        new Date(task[showSelectedActualStartStatusField]) > new Date(fields[showSelectedEndDateField])
                                                          ? 'highlight'
                                                          : ''
                                                      }>
                                                        {task[showSelectedActualStartStatusField] || '--'}
                                                    </td>
                                                )}
                                                {showselectedActualEndStatusField && (
                                                    <td key={showselectedActualEndStatusField}
                                                        className={
                                                            fields[showSelectedEndDateField] && 
                                                        task[showselectedActualEndStatusField] && 
                                                        new Date(task[showselectedActualEndStatusField]) > new Date(fields[showSelectedEndDateField])
                                                          ? 'highlight'
                                                          : ''
                                                      }>
                                                        {task[showselectedActualEndStatusField] || '--'}
                                                    </td>
                                                )}
                                                <td >{estimatedTime == "--" ? "--" : <LoggedTimeCell aggregatetimespent={estimatedTime} />}</td>
                                                <td>
                                                    {
                                                        actualTime === "--"
                                                            ? "--"
                                                            : (
                                                                <LoggedTimeCell
                                                                    aggregatetimespent={actualTime}
                                                                    highlight={parseFloat(actualTime) > parseFloat(estimatedTime)}
                                                                />
                                                            )
                                                    }
                                                </td>
                                                <td >{calculateVariation(estimatedTime, actualTime)}</td>
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
            {tasks && tasks.length >= 49 && (
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

export default TaskWiseCompletedJobLists;
