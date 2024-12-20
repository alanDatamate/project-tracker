import api, { route } from "@forge/api";

/** Fetch all projects */
const getProjects = async () => {
  const response = await api.asUser().requestJira(route`/rest/api/3/project`);
  return response.json();
};
/** Fetch all assignees */
const getAssigneesForProject = async (projectKey) => {
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/user/search/query?query=is assignee of ${projectKey}&fields=displayName,avatarUrls`
    );
  return response.json();
};
/** Fetch Date fields for project */
const getDateFieldsForProject = async (key) => {
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/createmeta?projectKeys=${key}&expand=projects.issuetypes.fields`
    );
  return response.json();
};
/** Fetch all status for project */
const getStatusesForProject = async (projectKey) => {
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/project/${projectKey}/statuses`);
  return response.json();
};
/** Fetch Start Date fields for a project */
const retrieveProjectDateFields = async (key, dateField) => {
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/issue/createmeta?projectKeys=${key}&expand=projects.issuetypes.fields`
    );
  const data = await response.json();
  const endDateFields = Object.values(
    data.projects[0].issuetypes[0].fields
  ).filter(
    (field) => field.name && field.name.toLowerCase().includes(dateField)
  );
  return endDateFields;
};
/** Fetch resource wise issues */
const getResourceWiseFilteredIssues = async (
  project,
  startDate,
  selectedStartDate,
  status
) => {
  const statusesArray = status
    ? status
        .split(",")
        .map((s) => `"${s.trim()}"`)
        .join(", ")
    : null;
  const jql = `project = ${project} 
    ${statusesArray ? `AND status IN (${statusesArray})` : ""}
    AND "${selectedStartDate}" >= "${startDate}"
    `.trim();
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/search?jql=${jql}&expand=changelog`);
  return response.json();
};
/** Fetch all Issues */
const getIssuesForStatuses = async (
  jql,
  status,
  startAt,
  startDate,
  endDate,
  maxResults,
  EndDateForConflictIssue,
  assignees = []
) => {
  const assigneeFilter = assignees.length
    ? `AND assignee IN (${assignees
        .map((assignee) => `"${assignee.displayName}"`)
        .join(", ")})`
    : "";
  const fullJql = `
    ${jql}
    AND status CHANGED TO ("${status}", "DEV IN PROGRESS","TO DO","READY FOR DEV","IN TASK REVIEW","PENDING CLARIFICATION") DURING ("${startDate}", "${endDate}")
    ${assigneeFilter}
    AND "${EndDateForConflictIssue}" IS NOT NULL
  `.trim();
  const response = await api
    .asUser()
    .requestJira(
      route`/rest/api/3/search?jql=${fullJql}&expand=changelog &startAt=${startAt}&maxResults=${maxResults}`
    );
  return response.json();
};

const getAssigneesScheduledIssuesList = async (project, startDate, endDate, assignee, selectedField) => {
  const jql = `${assignee ? `assignee="${assignee.displayName}" AND` : ''} "${selectedField.name}" >= "${startDate}" AND "${selectedField.name}" <= "${endDate}"`;
  const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}`);
  return response.json();
};



export {
  getProjects,
  getDateFieldsForProject,
  getStatusesForProject,
  getAssigneesForProject,
  getIssuesForStatuses,
  retrieveProjectDateFields,
  getResourceWiseFilteredIssues,
  getAssigneesScheduledIssuesList
};
