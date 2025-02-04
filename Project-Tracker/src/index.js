import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { getAssigneesForProject, getAssigneesScheduledIssuesList, getBoards, getDateFieldsForProject, getIssuesForStatuses, getProjects, getResourceWiseFilteredIssues, getStatusesForProject, retrieveProjectDateFields } from './api/JIraApi';

const resolver = new Resolver();

/** Fetch all projects */
resolver.define('getProjects', async () => {
  try {
    const projects = await getProjects();
    return { projects };
  } catch (error) {
    return { error: error.message || "Failed to fetch projects" };
  }
});
/** Fetch all projects */
resolver.define('getBoards', async () => {
  try {
    const boards = await getBoards();
    return boards?.values;
  } catch (error) {
    return { error: error.message || "Failed to fetch boards" };
  }
});

/** Fetch all users assigned for project */
resolver.define("getAssigneesForProject", async (req) => {
  const { key } = req.payload;

  try {
    const assignees = await getAssigneesForProject(key)
    if (!assignees?.values) {
      return { assignees: [] };
    }
    return { assignees: assignees.values }
  } catch (error) {
    return { error: error.message || "Failed to fetch assignees" };
  }
});
/** Fetch all users assigned for project */
resolver.define('getDateFieldForProject', async (req) => {
  const { key } = req.payload;
  try {
    const data = await getDateFieldsForProject(key);
    if (!data?.projects?.length) {
      return {
        formattedFields: []
      }
    }
    const projectData = data.projects[0];
    const fields = [];
    const seenIds = new Set();

    projectData.issuetypes.forEach((type) => {
      Object.values(type.fields).forEach((field) => {
        if (field.schema?.type == "date" && !seenIds.has(field.key)) {
          fields.push({ id: field.key, name: field.name });
          seenIds.add(field.key);
        }
      })
    })

    const statusFields = await getStatusesForProject(key)
    const taskStatuses = getTaskStatuses(statusFields)
    return {
      formattedFields: fields,
      statuses: taskStatuses,
    };

  } catch (error) {
    return { error: error.message || "Failed to fetching date fields , try again" };
  }
});
const getTaskStatuses = (statusFields) => {
  const taskStatuses = statusFields.reduce((acc, { name, statuses }) => {
    if (name == "Task") {
      return statuses.map(({ id, name }) => ({ id, name }))
    }
    return acc
  }, [])
  return taskStatuses;
}
/** Fetch all statuses for project */
resolver.define('getProjectStatus', async (req) => {
  const { key } = req.payload;
  try {
    const statusFields = await getStatusesForProject(key)
    const taskStatuses = getTaskStatuses(statusFields)
    const reverseTaskStatuses =taskStatuses ? taskStatuses.reverse() : []
    return {
      statuses: reverseTaskStatuses,
    };
  } catch (error) {
    return { error: error.message || "Failed to fetch statuses" };
  }
});
/** Fetch all conflict issues */
resolver.define("getConflictIssues", async (req) => {
  let { maxResults = 50, status, jql, startDate, endDate, EndDateForConflictIssue, EndDateForConflictIssueKey, assignee } = req.payload;
  
  if(EndDateForConflictIssue == "Due date") {
    EndDateForConflictIssue = "DUE"
  }
  let startAt = 0;
  let allIssues = [];
  let totalIssues = 0;
  try {
    do {
      const data = await getIssuesForStatuses(jql, status, startAt, startDate, endDate, maxResults, EndDateForConflictIssue, assignee);
      if (!data?.issues || data.issues.length === 0 ) break;
      const filteredIssues = data.issues.reduce((acc, issue) => {
        const devEndDate = new Date(issue.fields[EndDateForConflictIssueKey]);
        const statusChangeHistory = issue.changelog.histories.find((history) =>
          history.items.some(item => item.field === "status" && item.toString === status)
        );
        if (statusChangeHistory) {
          const statusUpdatedDate = new Date(statusChangeHistory.created);
          devEndDate.setHours(0, 0, 0, 0); 
          statusUpdatedDate.setHours(0, 0, 0, 0); 
          if (statusUpdatedDate > devEndDate) {
            acc.push({
              key: issue.key,
              fields: {
                summary: issue.fields.summary,
                assignee: {
                  displayName: issue.fields.assignee?.displayName || "Unassigned",
                  avatarUrls: issue.fields.assignee?.avatarUrls,
                },
                customfield_10059: {
                  displayName: issue.fields.customfield_10059?.[0]?.displayName || "Unassigned",
                  avatarUrls: issue.fields.customfield_10059?.[0]?.avatarUrls,
                },
                customfield_10063: {
                  displayName: issue.fields.customfield_10063?.[0]?.displayName || "Unassigned",
                  avatarUrls: issue.fields.customfield_10063?.[0]?.avatarUrls,
                },
                customfield_10060: {
                  displayName: issue.fields.customfield_10060?.[0]?.displayName || "Unassigned",
                  avatarUrls: issue.fields.customfield_10060?.[0]?.avatarUrls,
                },
                status: { name: issue.fields.status.name },
                aggregatetimeoriginalestimate: issue.fields.aggregatetimeoriginalestimate || 0,
                timeSpent: issue.fields.timespent || 0,
                aggregateremainingestimate: issue.fields.aggregateremainingestimate || 0,
                statusUpdatedDate: statusUpdatedDate,
                EndDate: devEndDate,
              },
            });
          }
        }
        return acc;
      }, []);
      allIssues = [...allIssues, ...filteredIssues];
      startAt += maxResults;
      totalIssues = data.total;
    } while (startAt < totalIssues);
    return {
      issues: allIssues,
      total: allIssues.length,
    };
  } catch (error) {
    console.log(error)
    return { error: error.message || "Failed to fetch conflict issues" };
  }
});


/** Retrieve project date fields */
resolver.define('retrieveProjectDateFields', async (req) => {
  const { key } = req.payload;
  try {
    const startDates = await retrieveProjectDateFields(key, "start date");
    const endDates = await retrieveProjectDateFields(key, "end date");
    const startDateFields = startDates
    .filter(field => field.schema?.type === "date")
    .map(field => ({ id: field.key, name: field.name }));
    const endDateFields = endDates
    .filter(field => field.schema?.type === "date")
      .map(field => ({ id: field.key, name: field.name }));
    endDateFields.push({ id: 'duedate', name: 'Due date' })

    return {
      startDates: startDateFields,
      endDates: endDateFields,
    };
  } catch (error) {
    return { error: error.message || "Failed to retrieve Date fields" };
  }
});

/** <----------------------------------------------------------------------------------------------> */
resolver.define('applyClientWiseFilters', async (req) => {
  const { key, status } = req.payload;
  const projectKeysFromPayload = key.split(',').map(item => item.split(':')[0]);
  const maxResults = 50;
  let totalIssues = 0;
  let projects = {};
  projectKeysFromPayload.forEach(projectKey => {
    projects[projectKey] = {
      projectName: '',
      timespent: 0,
      aggregatetimeoriginalestimate: 0,
      lastTaskDueDate: null,
      projectAvatarUrl: ''
    };
  });
  const statusFilter = status ? `AND status in (${status.split(',').map(s => `"${s.trim()}"`).join(',')})` : '';
  const jqlQuery = `project in (${projectKeysFromPayload}) AND timespent is not EMPTY ${statusFilter} order by created DESC`;

  const fetchPage = async (startAt) => {
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jqlQuery}&startAt=${startAt}&maxResults=${maxResults}&fields=project,timespent,aggregatetimeoriginalestimate,duedate`);
    return await response.json();
  };

  try {
    const firstPageData = await fetchPage(0);
    totalIssues = firstPageData.total;
    const allData = [firstPageData];
    for (let i = maxResults; i < totalIssues; i += maxResults) {
      allData.push(await fetchPage(i));
    }
    for (let data of allData) {
      if(data?.issues){
        for (let issue of data.issues) {
          const { key: projectKey, name: projectName, avatarUrls } = issue.fields.project;
          const { duedate, timespent = 0, aggregatetimeoriginalestimate = 0 } = issue.fields;
          if (projects[projectKey]) {
            const project = projects[projectKey];
            if (!project.projectName) {
              project.projectName = projectName;
              project.projectAvatarUrl = avatarUrls?.["24x24"] || '';
            }
            project.timespent += timespent;
            project.aggregatetimeoriginalestimate += aggregatetimeoriginalestimate;
            if (duedate && (!project.lastTaskDueDate || duedate > project.lastTaskDueDate)) {
              project.lastTaskDueDate = duedate;
            }
          }
        }
      }
    }
    for (const projectKey of projectKeysFromPayload) {
      if (!projects[projectKey].projectName) {
        const projectResponse = await api.asUser().requestJira(route`/rest/api/3/project/${projectKey}`);
        const projectData = await projectResponse.json();
        projects[projectKey].projectName = projectData.name;
        projects[projectKey].projectAvatarUrl = projectData.avatarUrls?.["24x24"] || '';
      }
    } 
    return projects;
  } catch (error) {
    console.log(error)
    return { error: error.message || "Failed to fetch client wise fields" };
  }
});

 /* --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---  ---------------------------- */

resolver.define('applyResourcewiseFilters', async (req) => {
  const { project, selectedStartDate, startDate, status } = req.payload;
  try {
    const data = await getResourceWiseFilteredIssues(project, startDate, selectedStartDate.startDateName, status);
    let taskEndDateField = "customfield_10056"
    if (selectedStartDate.startDateName == "Dev Start Date") {
      taskEndDateField = taskEndDateField
    } else if (selectedStartDate.startDateName == "QA Start Date") {
      taskEndDateField = "customfield_10058"
    } else if (selectedStartDate.startDateName == "Imp Start Date") {
      taskEndDateField = "customfield_10062"
    }
    const groupedByAssignee = {};
    data.issues.forEach((issue) => {
      const assignee = issue.fields.assignee ? issue.fields.assignee.displayName : "Unassigned";
      const taskStartDate = new Date(issue.fields[selectedStartDate.startDateId]);
      const taskEndDate = new Date(issue.fields[taskEndDateField]);
      if (!groupedByAssignee[assignee]) {
        groupedByAssignee[assignee] = {
          tasks: [],
          earliestStartDate: taskStartDate,
          latestEndDate: taskEndDate,
        };
      }
      groupedByAssignee[assignee].tasks.push(issue);
      if (taskStartDate < groupedByAssignee[assignee].earliestStartDate) {
        groupedByAssignee[assignee].earliestStartDate = taskStartDate;
      }
      if (taskEndDate > groupedByAssignee[assignee].latestEndDate) {
        groupedByAssignee[assignee].latestEndDate = taskEndDate;
      }
    });
    const formattedAssigneeData = Object.keys(groupedByAssignee).map((assignee) => {
      const { earliestStartDate, latestEndDate } = groupedByAssignee[assignee];
      return {
        assignee,
        firstTaskStartDate: earliestStartDate,
        lastTaskEndDate: latestEndDate,
      };
    });
    return {
      assignees: formattedAssigneeData,
    };
  } catch (error) {
    return { error: error.message || "Failed to fetch issues" };
  }
});
/** <----------------------------------------------------------------------------------------------> */

/** Fetch all projects */
resolver.define('getAssigneesTaskScheduledList', async (req) => {
  const { project, startDate, endDate, assignee, selectedField } = req.payload;
  try {
    const response = await getAssigneesScheduledIssuesList(project, startDate.split("T")[0], endDate.split("T")[0], assignee[0], selectedField);
    const filteredIssues = response.issues
    .map((issue) => {
      const fieldValue = issue.fields[`${selectedField.id}`];
      if (fieldValue && !isNaN(new Date(fieldValue))) {
        return {
          start: new Date(fieldValue),
          end: new Date(fieldValue),
          title: issue.key,
        };
      }
    })
    .filter(Boolean);
    return {filteredIssues}
  } catch (error) {
    return { error: error.message || "Failed to fetch getAssigneesTaskScheduledList" };
  }
});

resolver.define('FetchPendingTasksForDevelopers', async (req) => {
  const { project, user, status, assigneeNames, startAt = 0, maxResults = 50, startDate, endDate,
    selectedEndDateField , selectedStartDateField
   } = req.payload;
  try {
    const validStartAt = (startAt !== null && startAt !== undefined) ? startAt : 0
    const statusesArray = status
      ? status.split(",").map((s) => `"${s.trim()}"`).join(", ")
      : null;
    const assigneeNamesArray = assigneeNames
      ? assigneeNames.map((assignee) => `"${assignee.displayName.trim()}"`).join(", ")
      : null;

    let jqlQuery = `project = "${project}"`;
    if (startDate && endDate) {
      jqlQuery += ` And cf[${selectedStartDateField.match(/\d+/)[0]}] >= ${startDate} AND cf[${selectedEndDateField.match(/\d+/)[0]}] <= ${endDate}`
    }
    if (statusesArray) {
      jqlQuery += ` AND STATUS IN (${statusesArray})`;
    } else {
      jqlQuery += ` AND STATUS NOT IN ("Done")`;
    }
    // if (user) {
    //   jqlQuery += ` AND "${user.name}" IS NOT EMPTY`;
    // }
    if (assigneeNamesArray) {
      jqlQuery += ` AND "developer[people]" IN (${assigneeNamesArray})`;
    }

    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jqlQuery}  ORDER BY created DESC&startAt=${validStartAt}&maxResults=${maxResults}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return { error: error.message || "Failed to fetch pending tasks for developers" };
  }
});


 
// Function to fetch issues for completed tasks
resolver.define('TaskWiseCompletedJobLists', async (req) => {
  const { project, user, selectedEndDateField, selectedStatus, selectedStartDateField, selectedActualEndStatus, startAt = 0, maxResults = 50,
    startDate , endDate
  } = req.payload;
  console.log(selectedEndDateField,selectedStartDateField)
  const selectedStatuses = [selectedStatus, selectedActualEndStatus];
  const validStartAt = (startAt !== null && startAt !== undefined) ? startAt : 0
  let jqlQuery = `project = "${project}" `;
  if (startDate && endDate) { 
    jqlQuery += ` AND cf[${selectedStartDateField.match(/\d+/)[0]}] >= "${startDate}" AND  cf[${selectedEndDateField.match(/\d+/)[0]}] <= "${endDate}"`
  }
  // if (user) {
  //     jqlQuery += ` AND "${user.name}" IS NOT EMPTY`;
  // }

  try {
    console.log(startDate , endDate)
    const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jqlQuery} ORDER BY created DESC&startAt=${validStartAt}&maxResults=${maxResults}&expand=changelog `);
    const data = await response.json();

    const issuesWithStatusChangeDate =  data.issues.map(issue => {
      let statusChangeDates = {};
      issue.changelog.histories.forEach(history => {
        history.items.forEach(item => {
          if (item.field === 'status' && selectedStatuses.includes(item.toString)) {
          const formattedDate = new Date(history.created).toISOString().split("T")[0]
            if (!statusChangeDates[item.toString]) {
              statusChangeDates[item.toString] = formattedDate;
            }
          }
        });
      });
      return {
        ...issue,
        ...statusChangeDates
      };
    });
    return {
      issues: issuesWithStatusChangeDate,
      total : data.total
    };
  } catch (error) {
    console.log(error)
    return { error: error.message || "Failed to fetch TaskWiseCompletedJobLists" };
  }
}); 

resolver.define('getSprintsData', async (req) => {
  const { boardId } = req.payload;
    try {
        const sprintsResponse = await api.asUser().requestJira(route`/rest/agile/1.0/board/${boardId}/sprint`);
        const sprintsData = await sprintsResponse.json();
        const sprintDetailsPromises = sprintsData.values.map(async (sprint) => {
            try {
                const issuesResponse = await api.asUser().requestJira(route`/rest/api/3/search?jql=sprint=${sprint.id}`);
                const issuesData = await issuesResponse.json();
                let estimatedTime = 0;
                let actualTime = 0;
                issuesData.issues.forEach(issue => {
                    if (issue.fields.timeoriginalestimate) {
                        estimatedTime += issue.fields.timeoriginalestimate;
                    }
                    if (issue.fields.timespent) {
                        actualTime += issue.fields.timespent;
                    }
                });
                return {
                    sprintName: sprint.name,
                    startDate: sprint.startDate,
                    endDate: sprint.endDate,
                    estimatedTime: estimatedTime / 3600, 
                    actualTime: actualTime / 3600,       
                    status: sprint.state,                
                };

            } catch (issueError) {
                console.error(`Error fetching issues for sprint ${sprint.id}:`, issueError);
                return null;
            }
        });
        const sprintDetails = await Promise.all(sprintDetailsPromises);
        return sprintDetails.filter(sprint => sprint !== null);
    } catch (error) {
      console.error("Error fetching issues for sprint:", error);
      return { error: error.message || "Failed to fetch issues for sprint" };
    }
});

resolver.define('PendingTaskAgeList', async (req) => {
  const { key , statuses } = req.payload;
  const selectedStatuses = statuses.map(item => `'${item}'`).join(', ');
  try {
    let allTasks = [];
    let startAt = 0;
    const maxResults = 50;
    
    while (true) {
      const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=project=${key} AND status In (${selectedStatuses}) AND assignee IS NOT EMPTY&fields=assignee,created
        &maxResults=${maxResults}
        &startAt=${startAt}
      `);
      const data = await response.json();
      const currentDate = new Date();
      const tasksWithAge = data.issues.map((issue) => {
        const assignedDate = new Date();
        const ageInDays = Math.floor((currentDate - assignedDate) / (1000 * 60 * 60 * 24));
        return {
          issueKey: issue.key,
          assignee: issue.fields.assignee.displayName,
          ageInDays,
        };
      });

      allTasks = [...allTasks, ...tasksWithAge];

      // If we've fetched all issues, stop the loop
      if (data.issues.length < maxResults) break;

      startAt += maxResults;
    }
    return allTasks;

  } catch (error) {
    console.error(error);
    return { error: error.message || "Failed to fetch pending tasks and calculate their age" };
  }
});



export const handler = resolver.getDefinitions();
