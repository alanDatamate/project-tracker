import React from "react";

const Loading = () => {
  return (
    <section className="flex justify-center items-center space-x-2 pb-3">
      <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div>
      <span>Loading tasks...</span>
    </section>
  );
};

export default Loading;
