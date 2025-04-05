'use client';
import {chat} from '@/services/chat.service';
import {useMutation} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';

type Message = {
	sender: 'user' | 'bot';
	text: string;
};

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const chatEndRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const {mutate, isPending} = useMutation({
		mutationFn: chat,
	});

	const handleSend = async () => {
		if (!input.trim()) return;
		console.log(isPending);

		const userMessage: Message = {sender: 'user', text: input};
		setMessages((prev) => [...prev, userMessage]);
		setInput('');

		mutate(input, {
			onError(error) {
				setMessages((prev) => [
					...prev,
					{sender: 'bot', text: error.message},
				]);
				console.log(isPending);
			},
			onSuccess(data: any) {
				const botMessage: Message = {
					sender: 'bot',
					text: data?.data?.response,
				};

				setMessages((prev) => [...prev, botMessage]);
			},
		});
	};

	return (
		<>
			<div className="lg:px-5 lg:grid lg:grid-cols-4 gap-x-10">
				<div className="rounded-br-4xl rounded-tl-4xl m-5 col-span-1 min-h-[calc(100vh-3rem)] bg-foreground dark:bg-card hidden lg:block"></div>
				<div className="lg:col-span-3 bg-card relative lg:rounded-4xl min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-3rem)] w-full">
					<div className="flex-1 overflow-y-auto p-4 space-y-5 max-h-[calc(100vh-6rem)]">
						{messages.map((msg, i) => (
							<div
								key={i}
								className={`py-4 px-3 max-w-md rounded-lg ${
									msg.sender === 'user'
										? 'bg-blue-950 text-foreground self-end ml-auto'
										: 'bg-foreground text-card self-start mr-auto'
								}`}
							>
								{msg.text}
							</div>
						))}
					</div>

					<div className="absolute bottom-0 w-full px-10 py-5">
						<div className="border border-foreground rounded-full w-full flex items-center">
							<input
								disabled={isPending}
								type="text"
								placeholder="Write a message"
								className="px-5 py-4 !w-full outline-0"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) =>
									e.key === 'Enter' && handleSend()
								}
							/>
							<div className="px-1">
								<button
									disabled={isPending}
									className="bg-foreground text-card px-6 py-3 rounded-full"
									onClick={handleSend}
								>
									Send
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
