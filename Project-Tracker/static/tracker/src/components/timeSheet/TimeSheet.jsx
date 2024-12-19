import React, { useState } from 'react'
import ProjectFilterWithCheckBox from '../Filters/ProjectFilterWithCheckBox'
import AssigneeFilterDropdown from '../Filters/AssigneeFilter'
import { useSelector } from 'react-redux';

const TimeSheet = () => {
    const { projects } = useSelector((state) => state.filters);
    const [assignees, setAssignees] = useState([]);
    const [project, setProject] = useState([]);
    const handleProjectChange = (selectedProjects) => {
        console.log(selectedProjects)
    };
    const handleAssigneeChange = (assignee) => {
       
      };
    return (
        <aside>
            {/* Filters */}
            <section className='flex gap-2'>
                <ProjectFilterWithCheckBox
                    selectedProjects={"Project"}
                    projectOptions={projects}
                    onChange={handleProjectChange} />
                <AssigneeFilterDropdown
                    options={assignees}
                    onChange={handleAssigneeChange}
                    project={project}
                />
                <ul className='flex gap-2'>
                    <li>User</li>
                    <li><input type="date" /></li>
                    <li><button className='bg-blue-500 px-3 py-2'>Generate</button></li>
                </ul>
            </section>
            {/* table data */}
            <section>

            </section>

        </aside>
    )
}

export default TimeSheet
