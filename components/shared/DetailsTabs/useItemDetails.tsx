import { useState, useEffect } from 'react';

interface UseItemDetailsProps {
    itemId: string;
    itemType: 'asset' | 'accessory' | 'license' | 'component';
}

interface UseItemDetailsReturn {
    relationships: any[];
    attachments: any[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export const useItemDetails = ({ itemId, itemType }: UseItemDetailsProps): UseItemDetailsReturn => {
    const [relationships, setRelationships] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // You would replace these with your actual API calls
            const relationshipsPromise = fetch(`/api/${itemType}s/${itemId}/relationships`);
            const attachmentsPromise = fetch(`/api/${itemType}s/${itemId}/attachments`);

            const [relationshipsResponse, attachmentsResponse] = await Promise.all([
                relationshipsPromise,
                attachmentsPromise
            ]);

            const [relationshipsData, attachmentsData] = await Promise.all([
                relationshipsResponse.json(),
                attachmentsResponse.json()
            ]);

            setRelationships(relationshipsData);
            setAttachments(attachmentsData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch item details'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [itemId, itemType]);

    return {
        relationships,
        attachments,
        isLoading,
        error,
        refetch: fetchData
    };
};