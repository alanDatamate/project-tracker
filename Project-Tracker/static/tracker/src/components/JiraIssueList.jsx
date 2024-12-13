import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConflictingIssues,
  setSelectedStatusName,
} from "../redux/reducers/issuesSlice";
import { invoke } from "@forge/bridge";
import {
  setIssuesFetched,
  setProjects,
  setSeletedAssignees,
} from "../redux/reducers/filterSlice";
import IssueTable from "./IssueTable";
import Filters from "./Filters/Filters";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./shared/Pagination";
import NoTasksFound from "./shared/NoTasksFound";
import { FiAlertCircle, FiAlertCircley } from "react-icons/fi";

const JiraIssueList = () => {
  const dispatch = useDispatch();
  const {
    status,
    project,
    endDate,
    startDate,
    endDateStatusName,
    endDateStatusKey,
    issuesFetched,
  } = useSelector((state) => state.filters);
  const { filteredIssues, loading, total, seletedAssignees } = useSelector(
    (state) => state.issues
  );
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 50;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await invoke("getProjects");
        dispatch(setProjects(response.projects));
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [project, status]);

  useEffect(() => {
    dispatch(setSelectedStatusName(""));
    dispatch(setIssuesFetched(false));
    dispatch(setSeletedAssignees([]));
  }, [project]);

  useEffect(() => {
    if (
      project &&
      project !== "All" &&
      status &&
      startDate &&
      endDate &&
      endDateStatusName &&
      endDateStatusKey
    ) {
      const startAt = (currentPage - 1) * issuesPerPage;
      dispatch(
        fetchConflictingIssues({
          startAt,
          maxResults: issuesPerPage,
          project,
          status,
          startDate,
          endDate,
          endDateStatusName,
          endDateStatusKey,
          seletedAssignees,
        })
      );
    }
  }, [
    project,
    dispatch,
    status,
    currentPage,
    startDate,
    endDate,
    endDateStatusKey,
    endDateStatusName,
    seletedAssignees,
  ]);

  useEffect(() => {
    const totalPages = Math.ceil(total / issuesPerPage);
    setTotalPages(totalPages);
  }, [total]);

  return (
    <main>
      <Filters project={project} />
      {loading ? (
        <LoadingSpinner/>
      ) : (
        <>
          {filteredIssues && filteredIssues.length > 0 ? (
            <>
              <IssueTable issues={filteredIssues} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={issuesPerPage}
                totalItems={total}
              />
            </>
          ) : (
            issuesFetched && (
              <NoTasksFound
                desc={"tasks"}
              />
            )
          )}
        </>
      )}
    </main>
  );
};

export default JiraIssueList;
