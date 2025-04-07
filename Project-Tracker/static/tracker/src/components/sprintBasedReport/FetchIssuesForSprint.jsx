import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import Loading from '../Loading';
import BoardDropDown from '../Filters/BoardDropDown';

const FetchIssuesForSprint = () => {
    const [sprints, setSprints] = useState([]);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [boardSelected, setBoardSelected] = useState('');

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const boardData = await invoke('getBoards');
            setBoards(boardData);
        } catch (error) {
            console.error('Error fetching board data:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
    };

    const handleBoardChange = async (boardId) => {
        setBoardSelected(boardId);
        try {
            setLoading(true);

            const sprintData = await invoke('getSprintsData', { boardId });
            setSprints(sprintData);
        } catch (error) {
            console.error('Error fetching sprint data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div >
            {/* Board Dropdown */}
            <div className="mb-4 w-32">
                <BoardDropDown
                    option="Project"
                    options={boards}
                    onChange={handleBoardChange}
                    disableDispatch={true}
                />
            </div>

            {/* Display Sprint Data if Board is Selected */}
            {boardSelected && (
                <section className="overflow-y-auto max-h-[500px] relative">
                    {/* Table for Sprint Data */}
                    <table className="min-w-full table-auto overflow-x-auto shadow-lg rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 text-left text-sm font-semibold border-b">
                                <th className="py-3 px-4">Sprint</th>
                                <th className="py-3 px-4">Start Date</th>
                                <th className="py-3 px-4">End Date</th>
                                <th className="py-3 px-4">Estimated Time (hrs)</th>
                                <th className="py-3 px-4">Actual Time (hrs)</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-3 px-4 text-center">
                                        <Loading />
                                    </td>
                                </tr>
                            ) : sprints.length > 0 ? (
                                sprints.map((sprint, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50 text-sm">
                                        <td className="py-3 px-4">{sprint.sprintName}</td>
                                        <td className="py-3 px-4">{formatDate(sprint.startDate)}</td>
                                        <td className="py-3 px-4">{formatDate(sprint.endDate)}</td>
                                        <td className="py-3 px-4">{sprint.estimatedTime.toFixed(2)} hrs</td>
                                        <td className="py-3 px-4">{sprint.actualTime.toFixed(2)} hrs</td>
                                        <td className={`py-3 px-4 ${sprint.status !== 'closed' ? 'text-green-500' : 'text-red-500'}`}>
                                            {sprint.status}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-3 px-4 text-center text-gray-500">
                                        No sprints available for this board.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            )}
        </div>
    );
};

export default FetchIssuesForSprint;
