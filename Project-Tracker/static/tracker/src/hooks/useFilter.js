import {
  useDispatch,
  useSelector
} from "react-redux";
import {
  setStatus,
  setProject,
  setStartDate,
  setEndDate,
} from "../redux/reducers/filterSlice";

export const useFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.filters);

  const handleStatusChange = (value) => dispatch(setStatus(value));
  const handleProjectChange = (value) => dispatch(setProject(value));
  const handleStartDateChange = (value) => dispatch(setStartDate(value));
  const handleEndDateChange = (value) => dispatch(setEndDate(value));

  return {
    filters,
    handleStatusChange,
    handleProjectChange,
    handleStartDateChange,
    handleEndDateChange,
  };
};