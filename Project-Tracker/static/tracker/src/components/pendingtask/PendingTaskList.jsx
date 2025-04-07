import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import CustomDropdown from '../Filters/CustomDropdown';
import { useSelector } from 'react-redux';
import Loading from '../Loading';
import StatusFilterDropdown from '../Filters/StatusFilter';

const PendingTaskList = () => {
    const filters = useSelector((state) => state.filters);
    const [taskCountsByMember, setTaskCountsByMember] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null); 
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [statuses, setStatuses] = useState([]);
    
    // Calculate task age based on assigned date
    const calculateAge = (assignedDate) => {
        const assignedDateObj = new Date(assignedDate);
        const currentDate = new Date();
        const timeDiff = currentDate - assignedDateObj;
        const ageInDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        return ageInDays;
    };

    // Group tasks by assignee and age
    const groupTasksByAssigneeAndAge = (tasks) => {
        const groupedData = {};

        tasks.forEach((task) => {
            const age = calculateAge(task.assignedDate);
            const assignee = task.assignee || 'Unassigned';
            if (!groupedData[assignee]) {
                groupedData[assignee] = {
                    '0-3 days': 0,
                    '4-7 days': 0,
                    '8-14 days': 0,
                    '15-30 days': 0,
                    '31+ days': 0,
                };
            }
            if (age <= 3) {
                groupedData[assignee]['0-3 days'] += 1;
            } else if (age >= 4 && age <= 7) {
                groupedData[assignee]['4-7 days'] += 1;
            } else if (age >= 8 && age <= 14) {
                groupedData[assignee]['8-14 days'] += 1;
            } else if (age >= 15 && age <= 30) {
                groupedData[assignee]['15-30 days'] += 1;
            } else {
                groupedData[assignee]['31+ days'] += 1;
            }
        });

        return groupedData;
    };

    // Handle project change from dropdown
    const handleProjectChange = useCallback((selectedProject) => {
        setSelectedProject(selectedProject); // Update selected project
    }, []);
    const handleStatusChange = useCallback((selectedStatus) => {
        setSelectedStatus(selectedStatus); // Update selected status
    }, []);

    // Fetch tasks when component mounts or when selected project changes
    useEffect(() => {
        fetchStatuses();
    }, [selectedProject]); // Trigger effect whenever the selected project changes


    // Fetch tasks when the Generate button is clicked
    const fetchTasks = async () => {
        if (!selectedProject || !selectedStatus.length) return; // Don't fetch if no project or status is selected
        setLoading(true); // Set loading state to true while fetching
        try {
            const fetchedTasks = await invoke('PendingTaskAgeList', { key: selectedProject, statuses: selectedStatus });
            const taskCounts = groupTasksByAssigneeAndAge(fetchedTasks);
            setTaskCountsByMember(taskCounts);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false); // Set loading state to false when done
        }
    };
    const fetchStatuses = async () => {
        if (!selectedProject) return;
        try {
            const { statuses } = await invoke('getProjectStatus', { key: selectedProject });
            setStatuses(statuses);
        } catch (error) {
            console.error('Error fetching status :', error);
        }
    };

    return (
        <section>
            <nav className="flex gap-4 pb-3">
                <CustomDropdown
                    option="Select a Project"
                    options={filters.projects}
                    onChange={handleProjectChange}
                    disableDispatch={true}
                />
                {selectedProject && (
                    <>
                        <StatusFilterDropdown
                            selectedStatus={"Select Status"}
                            statusOptions={statuses}
                            project={selectedProject}
                            onChange={handleStatusChange} />

                        <div>
                            <button
                                onClick={fetchTasks}
                                className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={loading}
                            >
                                {!loading ? (
                                    "Generate"
                                ) : (
                                    "Loading..."
                                )}
                            </button>
                        </div>

                    </>
                )}
            </nav>

            <div className="p-6">
                {loading ? (
                    <Loading />
                ) : (
                    <div className="overflow-x-auto">
                        {Object.entries(taskCountsByMember).map(([assignee, ageGroups]) => (
                            <div key={assignee} className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">{assignee}</h3>
                                <table className="min-w-full table-auto border-collapse border border-gray-200 mt-4">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 border-b text-left text-gray-700">Age Range</th>
                                            <th className="px-4 py-2 border-b text-left text-gray-700">Pending Task Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(ageGroups).map(([ageRange, count]) => (
                                            <tr key={ageRange} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2">{ageRange}</td>
                                                <td className="px-4 py-2 text-blue-500">{count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PendingTaskList;
