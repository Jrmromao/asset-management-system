'use client';

import { QueryClient, QueryClientProvider  as QCP } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QCP client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QCP>
    );
}