import React from "react";

const TableHeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="w-[300px]">
        <div className="h-10 w-full rounded-md bg-gray-200 animate-pulse" />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-10 w-[100px] rounded-md bg-gray-200 animate-pulse" />
        <div className="h-10 w-[100px] rounded-md bg-gray-200 animate-pulse" />
        <div className="h-10 w-[120px] rounded-md bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
};

export default TableHeaderSkeleton;
