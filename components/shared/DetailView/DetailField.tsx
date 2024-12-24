import React, { ReactNode } from 'react';
import { DetailField as DetailFieldType } from './types';

interface DetailFieldProps {
    label: string;
    field: DetailFieldType;
    icon?: ReactNode;
}

export const DetailField: React.FC<DetailFieldProps> = ({
                                                            label,
                                                            field,
                                                            icon
                                                        }) => {
    const formatValue = (field: DetailFieldType) => {
        if (field.value === undefined) return 'N/A';

        switch (field.type) {
            case 'currency':
                return typeof field.value === 'number'
                    ? `€${field.value.toFixed(2)}`
                    : field.value;
            case 'date':
                return field.value ? new Date(field.value).toLocaleDateString() : 'N/A';
            default:
                return field.value;
        }
    };

    return (
        <div>
            <dt className="flex items-center gap-2 text-gray-500 text-sm">
                {icon}
                <span>{label}</span>
            </dt>
            <dd className="text-gray-900 font-medium mt-0.5 ml-6">
                {formatValue(field)}
            </dd>
        </div>
    );
};