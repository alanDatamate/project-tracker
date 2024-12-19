import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConflictingIssues,
  setSelectedStatusName,
} from "../redux/reducers/issuesSlice";
import {
  setIssuesFetched,
  setSeletedAssignees,
} from "../redux/reducers/filterSlice";
import IssueTable from "./IssueTable";
import Filters from "./Filters/Filters";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./shared/Pagination";
import NoTasksFound from "./shared/NoTasksFound";

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
    <section>
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
    </section>
  );
};

export default JiraIssueList;
