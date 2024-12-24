import React from 'react';
import {DetailViewProps} from './types';
import {DetailField} from './DetailField';
import {ActionButtons} from './ActionButtons';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import QRCode from "react-qr-code";
import {
    Monitor,
    MapPin,
    Tag,
    RefreshCcw,
    Laptop,
    User,
    Calendar, BatteryFull, BatteryMedium, BatteryLow, Battery, Leaf
} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

// Icon mapping for each field type
const fieldIcons = {
    'Name': Monitor,
    'Location': MapPin,
    'Tag Number': Tag,
    'Last Updated': RefreshCcw,
    'Category': Laptop,
    'Assigned To': User,
    'Created At': Calendar,
} as const;


const getCO2ScoreInfo = (score: number) => {
    if (score <= 30) {
        return {
            color: 'bg-emerald-100 text-emerald-800',
            icon: BatteryFull,
            label: 'Excellent',
            description: 'Very low carbon footprint',
        };
    }
    if (score <= 60) {
        return {
            color: 'bg-green-100 text-green-800',
            icon: BatteryMedium,
            label: 'Good',
            description: 'Low carbon footprint',
        };
    }
    if (score <= 90) {
        return {
            color: 'bg-yellow-100 text-yellow-800',
            icon: BatteryLow,
            label: 'Fair',
            description: 'Moderate carbon footprint',
        };
    }
    return {
        color: 'bg-red-100 text-red-800',
        icon: Battery,
        label: 'High',
        description: 'High carbon footprint',
    };
};

export const DetailView: React.FC<DetailViewProps> = ({
                                                          title,
                                                          fields,
                                                          actions,
                                                          qrCode,
                                                          breadcrumbs
                                                      }) => {
    // Helper function to find fields
    const getField = (label: string) => fields.find(f => f.label === label);
    const co2Score = 4900;
    const scoreInfo = getCO2ScoreInfo(co2Score);
    const IconComponent = scoreInfo.icon;
    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="flex items-center justify-between px-4 py-5 sm:px-6">
                {breadcrumbs}
            </div>
            <div className="px-4 py-1 sm:px-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h3>
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
                    {getField('Price') && (
                        <span className="text-sm text-gray-600">
              €{Number(getField('Price')?.value).toLocaleString()}
            </span>
                    )}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                <span
                    className={`px-3 py-1 text-sm rounded-full ${scoreInfo.color} flex items-center gap-2 cursor-help bg-white`}>
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
                                    <p className="font-medium">{scoreInfo.label} Carbon Footprint</p>
                                    <p className="text-sm">{scoreInfo.description}</p>
                                    <div className="text-xs text-muted-foreground">
                                        <p>• Annual CO₂ emissions: {co2Score}kg</p>
                                        <p>• Compared to average: {Math.round((co2Score / 75) * 100)}%</p>
                                        <p>• Environmental impact: {scoreInfo.label.toLowerCase()}</p>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <Card className="w-full">
                <CardHeader className="text-xl">
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
                        <div className="lg:col-span-5 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {fields
                                    .filter(field =>
                                        ['Name', 'Location', 'Tag Number', 'Last Updated', 'Category', 'Assigned To', 'Created At']
                                            .includes(field.label)
                                    )
                                    .map((field, index) => {
                                        const IconComponent = fieldIcons[field.label as keyof typeof fieldIcons];
                                        return (
                                            <DetailField
                                                key={index}
                                                label={field.label}
                                                field={field}
                                                icon={IconComponent &&
                                                    <IconComponent className="w-4 h-4 text-gray-400"/>}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            {qrCode}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-white">
                    <div
                        className="w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
                        {actions && (
                            <ActionButtons actions={actions}/>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};