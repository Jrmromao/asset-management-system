import React, {useState} from "react";
import {GrCircleInformation} from "react-icons/gr";

export const TooltipLabel = ({label, tooltip}: { label: string; tooltip: string }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative inline-flex items-center gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label} <GrCircleInformation className="h-4 w-4"/>
            {isHovered && (
                <div className="absolute left-full top-0 ml-2 bg-white p-2 rounded-md shadow-lg z-50 min-w-[200px]">
                    {tooltip}
                </div>
            )}
        </div>
    );
};