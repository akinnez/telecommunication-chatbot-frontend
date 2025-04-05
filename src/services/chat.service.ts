import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeoutErrorMessage: 'Connection Timeout',
	timeout: 1000 * 60,
});

export async function chat(message: string) {
	return await api.post(`/chat`, {message});
}
