import React from "react";

const Tooltip = ({ text }) => {
  return (
    <div
      className="absolute top-full left-1/2 
                       transform -translate-x-1/2 mt-2 
                       w-max max-w-2xl px-2 py-1 text-xs text-white
                       bg-gray-600 rounded shadow-lg 
                       opacity-0 group-hover:opacity-100 break-words z-50 pointer-events-none"
    >
      {text}
    </div>
  );
};

export default Tooltip;
