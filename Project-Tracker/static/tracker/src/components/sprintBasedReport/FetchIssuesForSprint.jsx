import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import Loading from '../Loading';

const FetchIssuesForSprint = () => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Call the resolver to get the sprint data
        const fetchData = async () => {
            try {
                const sprintData = await invoke('getSprintsData');
                setSprints(sprintData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching sprint data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <Loading/>;
    }
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
    };


    return (
        <section className="overflow-y-auto max-h-[500px] relative">
            
            <table className="min-w-full table-auto overflow-x-auto max-h-[500px] overflow-y-auto">
                <thead>
                <tr className="bg-gray-100 text-gray-700 text-left text-sm font-bold">
                        <th className="py-3 px-4 border-b">Sprint</th>
                        <th className="py-3 px-4 border-b">Start Date</th>
                        <th className="py-3 px-4 border-b">End Date</th>
                        <th className="py-3 px-4 border-b">Estimated Time (hrs)</th>
                        <th className="py-3 px-4 border-b">Actual Time (hrs)</th>
                        <th className="py-3 px-4 border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sprints.map((sprint, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 text-sm font-semibold">
                            <td className="py-3 px-4">{sprint.sprintName}</td>
                            <td className="py-3 px-4">{formatDate(sprint.startDate)}</td>
                            <td className="py-3 px-4">{formatDate(sprint.endDate)}</td>
                            <td className="py-3 px-4">{sprint.estimatedTime.toFixed(2)} hrs</td>
                            <td className="py-3 px-4">{sprint.actualTime.toFixed(2)} hrs</td>
                            <td className={`py-3 px-4 ${sprint.status !== "closed" ? "text-green-500" : "text-red-500"}`}>
  {sprint.status}
</td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default FetchIssuesForSprint;

