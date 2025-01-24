import { invoke } from '@forge/bridge';
import React, { useEffect, useState } from 'react';


const calculateVariation = (estimated, actual) => {
    if (estimated && actual) {
      return ((actual - estimated) / estimated) * 100;
    }
    return 0;
};

const TaskWiseCompletedJobLists = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const fetchedTasks = await invoke("TaskWiseCompletedJobLists");
      setTasks(fetchedTasks);
    };
    loadData();
  }, []);

  return (
      <div className="overflow-y-auto max-h-[500px] relative">
      <table className="min-w-full table-auto overflow-x-auto max-h-[500px] overflow-y-auto">
          <thead>
              <tr className="bg-gray-100 text-gray-700 text-left text-sm font-bold">
                  <th className="py-3 px-4 border-b">Key</th>
                  <th className="py-3 px-4 border-b">Summary</th>
                  <th className="py-3 px-4 border-b">Scheduled Start</th>
                  <th className="py-3 px-4 border-b">Actual Start</th>
                  <th className="py-3 px-4 border-b">Scheduled End</th>                      
                  <th className="py-3 px-4 border-b">Actual End</th>
                  <th className="py-3 px-4 border-b">Estimated Time</th>
                  <th className="py-3 px-4 border-b">Actual Time</th>
                  <th className="py-3 px-4 border-b">Variation %</th>
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
                                  <td className="py-3 px-4">{task.key}</td>
                                  <td className="py-3 px-4">
                                      {fields.summary.length > 20
                                          ? `${fields.summary.slice(0, 20)}...`
                                          : fields.summary}
                                  </td>
                                  <td className="py-3 px-4">{fields.customfield_12345 || '--'}</td>
                                  <td className="py-3 px-4">{fields.customfield_67890 || '--'}</td>
                                  <td className="py-3 px-4">{fields.customfield_11223 || '--'}</td>
                                  <td className="py-3 px-4">{fields.customfield_445566 || '--'}</td>
                                  <td className="py-3 px-4">{estimatedTime || '--'}</td>
                                  <td className="py-3 px-4">{actualTime || '--'}</td>
                                  <td className="py-3 px-4">{calculateVariation(estimatedTime, actualTime)}%</td>
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
  </div>
  );
};

export default TaskWiseCompletedJobLists;
