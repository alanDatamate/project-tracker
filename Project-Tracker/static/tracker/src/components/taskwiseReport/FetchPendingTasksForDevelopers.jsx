import React, { useEffect, useState, useCallback } from 'react';
import { invoke } from '@forge/bridge';
import { useSelector } from 'react-redux';
import AssigneeList from '../Filters/AssigneeList';
import CustomDropdown from '../Filters/CustomDropdown';
import ErrorModal from '../shared/ErrorModal';
import { FaEllipsisV } from 'react-icons/fa';

const FetchPendingTasksForDevelopers = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState(null);
    const [error, setError] = useState(null);
    const [assignees, setAssignees] = useState([]);
    const [selectedAssignee, setSelectedAssignee] = useState(null);
    const [selectedFields, setSelectedFields] = useState({});
    const filters = useSelector((state) => state.filters);
    const [customFields, setCustomFields] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showFieldOptions, setShowFieldOptions] = useState(false);

    // Fetch assignees when a project is selected
    useEffect(() => {
        const fetchAssignees = async () => {
            if (!project) {
                setAssignees([]);
                return;
            }
            try {
                const response = await invoke("getAssigneesForProject", { key: project });
                setAssignees(response.assignees || []);
            } catch (err) {
                console.error("Error fetching assignees:", err);
                setError('Failed to fetch assignees for the selected project.');
                setAssignees([]);
            }
        };
        fetchAssignees();
    }, [project]);

    // Fetch custom fields for a selected project
    useEffect(() => {
        const fetchCustomFields = async () => {
            if (!project) {
                setCustomFields([]);
                return;
            }
            try {
                const response = await invoke("getDateFieldForProject", { key: project });
                setCustomFields(response.formattedFields || []);
            } catch (err) {
                console.error("Error fetching custom fields:", err);
                setError('Failed to fetch custom fields for the selected project.');
                setCustomFields([]);
            }
        };
        fetchCustomFields();
    }, [project]);

    // Generate filtered tasks based on assignee and project
    const generateFilteredTask = async () => {
        if (selectedAssignee !== null && project) {
            setLoading(true);
            setError(null);
            setShowTable(true); // Show the table after clicking generate
            try {
                const fetchedTasks = await invoke("FetchPendingTasksForDevelopers", { selectedAssignee: selectedAssignee[0].displayName });
                setTasks(fetchedTasks);
            } catch (err) {
                setError('Failed to fetch tasks. Please try again.');
                setIsModalOpen(true);
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please select both a project and an assignee to fetch tasks.');
            setIsModalOpen(true);
        }
    };

    // Handle project change
    const handleProjectChange = useCallback((selectedProject) => {
        setProject(selectedProject);
        setSelectedAssignee(null); // Reset assignee when project changes
        setShowTable(false); // Reset table visibility on project change
        setSelectedFields({}); // Clear selected fields when project changes
    }, []);

    // Handle assignee selection
    const handleAssigneeChange = useCallback((assignee) => {
        setSelectedAssignee(assignee);
    }, []);

    // Handle field selection
    const handleFieldChange = (e) => {
        const { name, checked } = e.target;
        setSelectedFields((prevState) => ({
            ...prevState,
            [name]: checked,
        }));
    };

    // Close error modal
    const closeModal = () => {
        setIsModalOpen(false);
        setError(null); // Clear error when modal is closed
    };

    // Close dropdown when clicking outside
    const handleClickOutside = useCallback((event) => {
        if (event.target.closest('.dropdown-container') === null) {
            setShowFieldOptions(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);
    return (
        <>
            {error && isModalOpen && (
                <ErrorModal isModalOpen={isModalOpen} closeModal={closeModal} error={error} />
            )}

            <section className="shadow-lg rounded-lg flex">
                <div className="w-full">
                    <nav className="flex justify-between pb-3"> {/* Use justify-between to push the content to left and right */}
                        <article className="flex gap-4"> {/* Left section with dropdown and assignee list */}
                            <CustomDropdown
                                option="Select a Project"
                                options={filters.projects}
                                onChange={handleProjectChange}
                                disableDispatch={true}
                            />

                            {project && (
                                <div className="flex gap-3">
                                    <AssigneeList
                                        options={assignees}
                                        onChange={handleAssigneeChange}
                                        project={project}
                                    />
                                    {selectedAssignee !== null && (
                                        <button
                                            className="text-sm bg-blue-500 hover:bg-blue-600 p-1 text-white"
                                            onClick={generateFilteredTask}
                                        >
                                            Generate
                                        </button>
                                    )}
                                </div>
                            )}
                        </article>

                        <article> 
                            {project && (
                                <div >
                                    <div className="relative dropdown-container">
                                        <button
                                            onClick={() => setShowFieldOptions((prev) => !prev)}
                                            className="text-xs focus:outline-none font-black w-full hover:bg-gray-200"
                                        >
                                            <span className='flex items-center text-center'> <FaEllipsisV size={13} /> ADD ROWS </span> {/* Ellipsis icon */}
                                        </button>
                                        {showFieldOptions && (
                                            <div className="absolute right-0 z-30 mt-2 w-48 bg-white border rounded-lg shadow-lg p-3 max-h-40 overflow-y-auto">
                                                <div>
                                                    {customFields && customFields.length > 0 && customFields.map((field) => (
                                                        <label key={field.id} className="block text-sm">
                                                            <input
                                                                type="checkbox"
                                                                name={field.id}
                                                                checked={selectedFields[field.id] || false}
                                                                onChange={handleFieldChange}
                                                                className="mr-2"
                                                            />
                                                            {field.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </article>
                    </nav>


                    {loading ? (
                        <div className="flex justify-center items-center space-x-2">
                            <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
                            <span>Loading tasks...</span>
                        </div>
                    ) : (
                        showTable && (
                            <div className="overflow-y-auto max-h-[500px] relative">
                                <table className="min-w-full table-auto overflow-x-auto max-h-[500px] overflow-y-auto">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700 text-left text-sm font-bold">
                                            <th className="py-3 px-4 border-b">Key</th>
                                            <th className="py-3 px-4 border-b">Summary</th>
                                            <th className="py-3 px-4 border-b">Scheduled Start</th>
                                            <th className="py-3 px-4 border-b">Scheduled End</th>
                                            <th className="py-3 px-4 border-b">Current Progress</th>
                                            {customFields.filter(field => selectedFields[field.id]).map((field) => (
                                                <th key={field.id} className="py-3 px-4 border-b">{field.name}</th> // Display field name in table header
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks && tasks.length > 0 ? (
                                            tasks.map((task) => (
                                                <tr key={task.id} className="border-b hover:bg-gray-50 text-sm font-semibold">
                                                    <td className="py-3 px-4">{task.key}</td>
                                                    <td className="py-3 px-4">
                                                        {task.fields.summary.length > 20
                                                            ? `${task.fields.summary.slice(0, 20)}...`
                                                            : task.fields.summary}
                                                    </td>
                                                    <td className="py-3 px-4">{task.fields.startDate || '--'}</td>
                                                    <td className="py-3 px-4">{task.fields.duedate || '--'}</td>
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
                                                    {customFields.filter(field => selectedFields[field.id]).map((field) => (
                                                        <td key={field.id} className="py-3 px-4">
                                                            {task.fields[field.id] || '--'} {/* Display the field value based on ID */}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-3 px-4">
                                                    No tasks available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>

            </section>
        </>
    );
};

export default FetchPendingTasksForDevelopers;
