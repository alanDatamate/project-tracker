import React from "react";
import { IoIosSearch } from "react-icons/io";
import { useSelector } from "react-redux";

const SearchBar = ({ query, onSearch }) => {
  const { searchResults } = useSelector((state) => state.filters);
  return (
    <div className="w-full sm:w-80 relative mr-3">
      <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none"
      />
      {searchResults && searchResults.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md z-10">
          {searchResults.map((data, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-bold">{data.key}</div>
              <div className="text-sm text-gray-500">
                {data.fields.summary || "No summary available"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
