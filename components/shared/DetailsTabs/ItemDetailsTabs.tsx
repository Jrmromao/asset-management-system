import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaperclipIcon, ClockIcon, UserIcon, BoxIcon, KeyIcon, CpuIcon, PackageIcon } from "lucide-react";
import ActivityLog from "@/components/shared/ActivityLog/ActivityLog";
import { Badge } from "@/components/ui/badge";

// Types for different relationships
type RelationshipType = 'assigned_to' | 'assigned_to_asset' | 'checked_out_to' | 'licensed_to';

interface Attachment {
    id: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy: string;
}

interface Relationship {
    id: string;
    name: string;
    type: string;
    relationshipType: RelationshipType;
    date: string;
    notes?: string;
    status?: string;
}

interface ItemDetailsTabsProps {
    itemId: string;
    itemType: 'asset' | 'accessory' | 'license' | 'component';
    relationships?: Relationship[];
    attachments?: Attachment[];
    customTabs?: {
        [key: string]: {
            label: string;
            icon?: React.ReactNode;
            content: React.ReactNode;
        };
    };
}

const ItemDetailsTabs = ({
                             itemId,
                             itemType,
                             relationships = [],
                             attachments = [],
                             customTabs = {}
                         }: ItemDetailsTabsProps) => {

    // Helper function to get the appropriate icon based on item type
    const getItemTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'asset':
                return <BoxIcon className="h-4 w-4" />;
            case 'license':
                return <KeyIcon className="h-4 w-4" />;
            case 'component':
                return <CpuIcon className="h-4 w-4" />;
            case 'accessory':
                return <PackageIcon className="h-4 w-4" />;
            default:
                return <BoxIcon className="h-4 w-4" />;
        }
    };

    // Helper function to format relationship type for display
    const formatRelationshipType = (type: RelationshipType): string => {
        return type.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full space-y-4">
            <Tabs defaultValue="history" className="w-full">
                <TabsList className="inline-flex h-auto p-0 bg-transparent gap-1">
                    <TabsTrigger
                        value="history"
                        className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                        <ClockIcon className="h-4 w-4" />
                        History
                    </TabsTrigger>
                    <TabsTrigger
                        value="used-by"
                        className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                        <UserIcon className="h-4 w-4" />
                        Used By
                        {relationships.length > 0 && (
                            <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {relationships.length}
              </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="attachments"
                        className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    >
                        <PaperclipIcon className="h-4 w-4" />
                        Attachments
                    </TabsTrigger>
                    {Object.entries(customTabs).map(([key, tab]) => (
                        <TabsTrigger
                            key={key}
                            value={key}
                            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                        >
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/*<TabsContent value="info" className="mt-6">*/}
                {/*    <div className="space-y-4">*/}
                {/*        {Object.entries(fields).map(([key, value]) => (*/}
                {/*            <div key={key} className="flex border-b pb-4">*/}
                {/*                <div className="w-1/4 text-muted-foreground">{key}</div>*/}
                {/*                <div className="w-3/4">{value}</div>*/}
                {/*            </div>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*</TabsContent>*/}

                <TabsContent value="used-by" className="mt-6">
                    <div className="space-y-4">
                        {relationships.length > 0 ? (
                            <div className="divide-y">
                                {relationships.map((relation) => (
                                    <div key={relation.id} className="py-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {getItemTypeIcon(relation.type)}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{relation.name}</p>
                                                    {relation.status && (
                                                        <Badge variant="secondary">{relation.status}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatRelationshipType(relation.relationshipType)}
                                                    {relation.notes && ` • ${relation.notes}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(relation.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground">Not assigned to any user or asset</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="attachments" className="mt-6">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button size="sm">
                                <PaperclipIcon className="h-4 w-4 mr-2" />
                                Add Attachment
                            </Button>
                        </div>
                        {attachments.length > 0 ? (
                            <div className="divide-y">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="py-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{attachment.fileName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFileSize(attachment.fileSize)} • Uploaded by {attachment.uploadedBy}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(attachment.uploadedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground">No attachments found</div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <ActivityLog sourceType={itemType} sourceId={itemId} />
                </TabsContent>

                {Object.entries(customTabs).map(([key, tab]) => (
                    <TabsContent key={key} value={key} className="mt-4">
                        <Card>
                            <CardContent className="pt-6">
                                {tab.content}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default ItemDetailsTabs;