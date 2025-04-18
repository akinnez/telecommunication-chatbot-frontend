import {api} from '@/component/axios.settings';

export async function chat(payload: {message: string; threadId: string}) {
	return await api.post(`/chat`, payload);
}
