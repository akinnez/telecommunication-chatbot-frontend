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
	const [errorMessage, setErrorMessage] = useState('');
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

	const handleSend = async (customInput?: string) => {
		setErrorMessage('');
		const messageToSend = customInput ?? input;
		if (!messageToSend.trim()) return;

		const userMessage: Message = {sender: 'user', text: messageToSend};
		setMessages((prev) => {
			const hasMatch = messages.some(
				(obj: Message) => obj.text === userMessage.text
			);
			if (hasMatch) {
				return [...prev];
			}
			return [...prev, userMessage];
		});
		setInput('');

		mutate(input, {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onError(error: any) {
				const message =
					error?.response?.data?.message ||
					error.message ||
					'Something went wrong';
				setErrorMessage(message);
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
					<div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-5.8rem)]  h-[calc(100svh-13.59rem)] lg:h-fit">
						{messages.length == 0 ? (
							<div className="w-full flex min-h-[calc(100vh-8rem)] items-center justify-center">
								<div className="space-y-4">
									<h1 className="text-xl lg:text-3xl">
										Hello there😎❤️. I&#39;m KIRA.
									</h1>
									<p className="text-center text-xl">
										How can i assist you today?
									</p>
								</div>
							</div>
						) : (
							messages.map((msg, i) => (
								<div key={i}>
									{msg.sender === 'user' && (
										<>
											<div
												key={i}
												className={`py-4 px-3 max-w-fit lg:max-w-lg rounded-lg bg-blue-950 text-foreground self-end ml-auto
									}`}
											>
												{msg.text}
											</div>
											{errorMessage && (
												<div className="flex gap-x-5 max-w-fit lg:max-w-lg items-center mt-2 text-sm text-foreground self-end ml-auto">
													<p>{errorMessage}</p>
													<button
														onClick={async () => {
															setInput(msg.text);
															handleSend(
																msg.text
															);
														}}
														className="underline cursor-pointer text-blue-600"
													>
														Reload
													</button>
												</div>
											)}
										</>
									)}
									{msg.sender === 'bot' && !errorMessage && (
										<div
											key={i}
											className={`py-4 px-3 max-w-fit lg:max-w-lg rounded-lg ${'bg-foreground/85 text-card self-start mr-auto'}`}
										>
											{msg.text}
										</div>
									)}
								</div>
							))
						)}
						{isPending && (
							<div className="py-4 px-3 max-w-fit lg:max-w-lg rounded-lg bg-foreground/60 text-card self-start mr-auto animate-pulse">
								KIRA is typing...
							</div>
						)}
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
									onClick={() => handleSend()}
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
