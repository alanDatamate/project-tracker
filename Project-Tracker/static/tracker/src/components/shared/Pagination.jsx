import React, { useEffect } from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {

  useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(1);
    }
  }, [totalItems, totalPages, currentPage, onPageChange]);

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1) 
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return pages.filter((val, idx, arr) => arr.indexOf(val) === idx);
  };

  const renderRangeInfo = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return `${start}-${end} of ${totalItems}`;
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="flex-1 flex justify-center">
        <span className="text-sm text-gray-700 font-bold">{renderRangeInfo()}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="bg-gray-200 text-gray-700 px-3 text-xs font-bold py-1 rounded-sm hover:bg-gray-300"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &lt;
        </button>
        {renderPagination().map((page, index) => (
          <button
            key={index}
            className={`px-3 rounded-sm text-xs py-1 ${
              page === currentPage
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..." || page === currentPage}
          >
            {page}
          </button>
        ))}
        <button
          className="bg-gray-200 text-gray-700 font-bold px-3 text-xs py-1 rounded-sm hover:bg-gray-300"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
