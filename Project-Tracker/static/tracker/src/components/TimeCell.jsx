import React from "react";
import { Duration } from "luxon";

const LoggedTimeCell = ({ aggregatetimespent , highlight  }) => {
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds) return "0h";
    const duration = Duration.fromObject({ seconds: timeInSeconds }).shiftTo(
      "hours",
      "minutes"
    );
    return `${Math.floor(duration.hours)}h ${Math.floor(duration.minutes)}m`;
  };

  return <td className={highlight ? "highlight" : ""}>{formatTime(aggregatetimespent)}</td>;
};

export default LoggedTimeCell;
