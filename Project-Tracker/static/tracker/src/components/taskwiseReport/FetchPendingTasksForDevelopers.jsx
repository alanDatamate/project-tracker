import { invoke } from '@forge/bridge';
import React, { useEffect, useState } from 'react';


const FetchPendingTasksForDevelopers = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getPendingTasks = async () => {
            try {
                setLoading(true);
                const fetchedTasks = await invoke("FetchPendingTasksForDevelopers");
                setTasks(fetchedTasks);
            } catch (err) {
                setError('Error fetching tasks');
            } finally {
                setLoading(false);
            }
        };

        getPendingTasks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center space-x-2">
                <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
                <span>Loading tasks...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="shadow-lg rounded-lg">
            <div className="overflow-y-auto max-h-[500px] relative">
                <table className="min-w-full table-auto overflow-x-auto max-h-[500px] overflow-y-auto ">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-left">
                            <td className="py-3 px-4">key</td>
                            <th className="py-3 px-4 border-b">Summary</th>
                            <th className="py-3 px-4 border-b">Scheduled Start</th>
                            <th className="py-3 px-4 border-b">Scheduled End</th>
                            <th className="py-3 px-4 border-b">Current Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr key={task.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{task.key}</td>
                                <td className="py-3 px-4">{task.fields.summary.length > 15 ? task.fields.summary.slice(0, 40) + "..." : task.fields.summary}</td>
                                <td className="py-3 px-4">{task.fields.startDate || '--'}</td>
                                {/* <td className="py-3 px-4">{task.fields.dueDate || 'N/A'}</td> */}
                                <td className="py-3 px-4">{task.fields.duedate || '--'}</td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`py-1 px-3 rounded-full text-xs ${task.fields.status.name === 'In Progress'
                                            ? 'bg-yellow-200 text-yellow-800'
                                            : task.fields.status.name === 'To Do'
                                                ? 'bg-blue-200 text-blue-800'
                                                : 'bg-green-200 text-green-800'
                                            }`}
                                    >
                                        {task.fields.status.name}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default FetchPendingTasksForDevelopers;
