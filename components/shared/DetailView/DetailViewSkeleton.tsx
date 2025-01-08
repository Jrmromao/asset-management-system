import React from "react";

const DetailViewSkeleton = () => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg animate-pulse">
      {/* Breadcrumb placeholder */}
      <div className="flex items-center justify-between px-4 py-5 sm:px-6 border-b">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>

      {/* Title and tags placeholder */}
      <div className="px-4 py-1 sm:px-6">
        <div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap mb-3">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Main content placeholder */}
      <div className="border-t">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Fields Section */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code placeholder */}
            <div className="flex items-center justify-center p-4">
              <div className="w-32 h-32 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Custom fields placeholder */}
          <div className="mt-6 border-t pt-6">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions placeholder */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-10 bg-gray-200 rounded w-24"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailViewSkeleton;
