'use client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';
import {getQueryClient} from './makeQueryClient';

function QueryClientProviders({children}: {children: React.ReactNode}) {
	const [client] = useState(() => getQueryClient());
	return (
		<QueryClientProvider client={client as QueryClient}>
			{children}
		</QueryClientProvider>
	);
}

export default QueryClientProviders;
