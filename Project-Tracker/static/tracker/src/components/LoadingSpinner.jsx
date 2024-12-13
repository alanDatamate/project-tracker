import React from "react";

const LoadingSpinner = () => {
  return (
    <section className="flex justify-center items-center py-8 m-auto">
      <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    </section>
  );
};

export default LoadingSpinner;
