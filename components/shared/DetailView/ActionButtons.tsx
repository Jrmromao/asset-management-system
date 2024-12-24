'use client'

import React from 'react';
import { DetailViewProps } from './types';
import CustomButton from "@/components/CustomButton";
import {
    FaArchive,
    FaChevronLeft,
    FaChevronRight,
    FaCopy,
    FaPen,
    FaPrint
} from 'react-icons/fa';
import {Skeleton} from "@/components/ui/skeleton";

export const ActionButtons: React.FC<{
    actions: NonNullable<DetailViewProps['actions']>;
    isLoading?: boolean;
}> = ({ actions, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
                {Array(5).fill(null).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24" />
                ))}
            </div>
        );
    }

    return (


            <div
                className=" px-4 py-3 sm:px-6 flex-wrap w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
                {actions.onArchive && (
                    <CustomButton
                        size="sm"
                        className="w-full sm:w-auto"
                        variant="outline"
                        action={actions.onArchive}
                        value="Archive"
                        Icon={FaArchive}
                    />
                )}
                {actions.onUnassign ? (
                    <CustomButton
                        size="sm"
                        className="w-full sm:w-auto"
                        variant="outline"
                        action={actions.onUnassign}
                        value="Unassign"
                        Icon={FaChevronLeft}
                    />
                ) : actions.onAssign && (
                    <CustomButton
                        size="sm"
                        className="w-full sm:w-auto"
                        variant="outline"
                        action={actions.onAssign}
                        value="Assign"
                        Icon={FaChevronRight}
                    />
                )}
                {actions.onDuplicate && (
                    <CustomButton
                        className="w-full sm:w-auto md:w-auto"
                        size="sm"
                        variant="outline"
                        action={actions.onDuplicate}
                        value="Duplicate"
                        Icon={FaCopy}
                    />
                )}
                {actions.onEdit && (
                    <CustomButton
                        className="w-full sm:w-auto md:w-auto"
                        size="sm"
                        variant="outline"
                        action={actions.onEdit}
                        value="Edit"
                        Icon={FaPen}
                    />
                )}
                {actions.onPrintLabel && (
                    <CustomButton
                        className="w-full sm:w-auto md:w-auto"
                        size="sm"
                        variant="outline"
                        action={actions.onPrintLabel}
                        value="Print Label"
                        Icon={FaPrint}
                    />
                )}
            </div>
            );
            };