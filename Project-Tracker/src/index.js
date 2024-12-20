import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { getAssigneesForProject, getAssigneesScheduledIssuesList, getDateFieldsForProject, getIssuesForStatuses, getProjects, getResourceWiseFilteredIssues, getStatusesForProject, retrieveProjectDateFields } from './api/JIraApi';

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
    return { error: error.message || "Failed to fetch conflict issues" };
  }
});


/** Retrieve project date fields */
resolver.define('retrieveProjectDateFields', async (req) => {
  const { key } = req.payload;
  try {
    const startDates = await retrieveProjectDateFields(key, "start date");
    const startDateFields = startDates
    .filter(field => field.schema?.type === "date")
    .map(field => ({ id: field.key, name: field.name }));
    return {
      startDates: startDateFields,
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
    console.log(filteredIssues)
    return {filteredIssues}
  } catch (error) {
    console.log(error)
    return { error: error.message || "Failed to fetch getAssigneesTaskScheduledList" };
  }
});



export const handler = resolver.getDefinitions();
