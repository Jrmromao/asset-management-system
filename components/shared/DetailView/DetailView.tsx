import React from 'react';
import {DetailViewProps} from './types';
import {DetailField} from './DetailField';
import {ActionButtons} from './ActionButtons';
import {Card, CardContent, CardFooter} from '@/components/ui/card';
import {
    Calendar,
    Coins,
    Laptop,
    Leaf,
    MapPin,
    Monitor,
    RefreshCcw,
    Tag,
    User,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {getCO2ScoreInfo} from '@/lib/utils';

const fieldIcons = {
    Name: Monitor,
    Location: MapPin,
    'Tag Number': Tag,
    'Last Updated': RefreshCcw,
    Category: Laptop,
    'Assigned To': User,
    'Created At': Calendar,
    Price: Coins,
    Model: Coins,
} as const;

export const DetailView: React.FC<DetailViewProps> = ({
                                                          title,
                                                          co2Score,
                                                          isAssigned,
                                                          fields,
                                                          actions,
                                                          qrCode,
                                                          breadcrumbs,
                                                      }) => {
    const getField = (label: string) => fields.find((f) => f.label === label);
    const scoreInfo = getCO2ScoreInfo(co2Score ?? 0);
    const IconComponent = scoreInfo.icon;


    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Header Section */}
            <div className="flex items-center justify-between px-4 py-5 sm:px-6">
                {breadcrumbs}
            </div>

            {/* Title and Status Section */}
            <div className="px-4 py-1 sm:px-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    {getField('Tag Number') && (
                        <p className="text-sm text-gray-500 mt-1">
                            {getField('Tag Number')?.value}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 mt-4 flex-wrap mb-3">
                    {getField('Status') && (
                        <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
              {getField('Status')?.value}
            </span>
                    )}

                    {/* CO2 Tooltip */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span
                    className={`px-3 py-1 text-sm rounded-full ${scoreInfo.color} flex items-center gap-2 cursor-help bg-white`}
                >
                  <IconComponent className="w-4 h-4"/>
                  <span className="flex items-center gap-1">
                    <Leaf className="w-3 h-3"/>
                    CO₂ {co2Score}kg
                  </span>
                  <span className="font-medium">{scoreInfo.label}</span>
                </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-white">
                                <div className="space-y-2">
                                    <p className="font-medium">
                                        {scoreInfo.label} Carbon Footprint
                                    </p>
                                    <p className="text-sm">{scoreInfo.description}</p>
                                    <div className="text-xs text-muted-foreground">
                                        <p>• Annual CO₂ emissions: {co2Score}kg</p>
                                        <p>
                                            • Compared to average: {co2Score ? Math.round((co2Score / 75) * 100) : '-'}
                                            %
                                        </p>
                                        <p>• Environmental impact: {scoreInfo.label.toLowerCase()}</p>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <Card className="w-full">
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
                        {/* Fields */}
                        <div className="lg:col-span-5 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {fields
                                    .filter((field) =>
                                        [
                                            'Name',
                                            'Location',
                                            'Tag Number',
                                            'Last Updated',
                                            'Category',
                                            'Assigned To',
                                            'Created At',
                                            'Price',
                                            'Model',
                                        ].includes(field.label)
                                    )
                                    .map((field, index) => {
                                        const IconComponent =
                                            fieldIcons[field.label as keyof typeof fieldIcons];
                                        return (
                                            <DetailField
                                                key={index}
                                                label={field.label}
                                                field={field}
                                                icon={
                                                    IconComponent && (
                                                        <IconComponent className="w-4 h-4 text-gray-400"/>
                                                    )
                                                }
                                            />
                                        );
                                    })}
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="p-4 flex items-center justify-center">{qrCode}</div>
                    </div>
                </CardContent>

                {/* Action Buttons */}
                <CardFooter className="bg-white">
                    <div
                        className="w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
                        {actions && <ActionButtons actions={actions} isAssigned={isAssigned}/>}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
