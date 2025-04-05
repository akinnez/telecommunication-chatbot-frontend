'use client';
import {
	defaultShouldDehydrateQuery,
	isServer,
	QueryClient,
} from '@tanstack/react-query';

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5,
				retry: false,
				refetchOnWindowFocus: false,
			},
			dehydrate: {
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === 'pending',
			},
		},
	});
}

let browserClient: QueryClient | undefined = undefined;

export function getQueryClient() {
	if (isServer) {
		return makeQueryClient();
	} else if (!browserClient) {
		browserClient = makeQueryClient();
		return browserClient;
	}
}
