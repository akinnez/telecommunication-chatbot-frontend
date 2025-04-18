'use client';
import {chat} from '@/services/chat.service';
import {useMutation} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {v4 as id} from 'uuid';
type Message = {
	sender: 'user' | 'bot';
	text: string;
	error?: string;
};

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');

	const [errorMessage, setErrorMessage] = useState('');
	const [threadId, setThreadId] = useState('');
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const chatEndRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);
	useEffect(() => {
		if (!threadId) {
			setThreadId(id());
		}
	}, [threadId]);

	const {mutate, isPending} = useMutation({
		mutationFn: chat,
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function errorMess(msg: any, message: string) {
		setErrorMessage(message);
		return {...msg, error: message};
	}

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
		mutate(
			{message: messageToSend, threadId},
			{
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onError(error: any) {
					const message =
						error?.response?.data?.message ||
						error.message ||
						'Something went wrong';
					setMessages((prev) =>
						prev.map((msg, index) =>
							index === prev.length - 1 && msg.sender === 'user'
								? errorMess(msg, message) // ✅ attach error to last user message
								: msg
						)
					);
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onSuccess(data: any) {
					const botMessage: Message = {
						sender: 'bot',
						text: data?.data?.response,
					};

					setMessages((prev) => [...prev, botMessage]);
				},
			}
		);
	};

	return (
		<>
			<div className="lg:grid lg:grid-cols-4">
				<div className="rounded-br-4xl rounded-tl-4xl m-5 col-span-1 min-h-[calc(100vh-3rem)] bg-foreground dark:bg-card hidden lg:block"></div>
				<div className="flex flex-col h-screen bg-card col-span-3">
					{/* <header className="px-6 py-4 border-b border-border text-lg font-semibold bg-background">
							KIRA Chat 🤖
						</header> */}

					<div className="flex-1 overflow-y-auto px-4 lg:px-10 py-6 space-y-4">
						{messages.length == 0 ? (
							<div className="flex h-full items-center justify-center text-center text-xl text-muted-foreground">
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
												className={`py-4 px-3 max-w-fit lg:max-w-lg rounded-lg bg-blue-950 text-foreground self-end ml-auto`}
											>
												<ReactMarkdown
													remarkPlugins={[remarkGfm]}
												>
													{msg.text}
												</ReactMarkdown>
											</div>
											{errorMessage && (
												<div className="flex gap-x-5 max-w-fit lg:max-w-lg items-center mt-2 text-sm text-foreground self-end ml-auto">
													<p>
														{msg.error ||
															'no error message'}
													</p>
													<button
														onClick={async () => {
															setErrorMessage('');
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
					<footer className="px-6 py-4 border-t border-border bg-background">
						<div className="flex items-end gap-2">
							<textarea
								ref={inputRef}
								rows={1}
								value={input}
								disabled={isPending}
								placeholder="Type your message..."
								className="flex-1 resize-none rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground"
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										handleSend();
									}
								}}
							/>
							<button
								disabled={isPending}
								className="bg-foreground text-card rounded-xl px-4 py-3 disabled:opacity-50"
								onClick={() => handleSend()}
							>
								Send
							</button>
						</div>
					</footer>
					{/* <div className="absolute bottom-0 w-full px-10 py-5">
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
					</div> */}
				</div>
			</div>
		</>
	);
}

// 'use client';
// import {chat} from '@/services/chat.service';
// import {useMutation} from '@tanstack/react-query';
// import {useEffect, useRef, useState} from 'react';

// type Message = {
// 	sender: 'user' | 'bot';
// 	text: string | string[] | any;
// 	error?: string;
// };

// export default function Home() {
// 	const [messages, setMessages] = useState<Message[]>([]);
// 	const [input, setInput] = useState('');
// 	const [errorMessage, setErrorMessage] = useState('');
// 	const inputRef = useRef<HTMLTextAreaElement | null>(null);
// 	const chatEndRef = useRef<HTMLDivElement | null>(null);

// 	useEffect(() => {
// 		inputRef.current?.focus();
// 		scrollToBottom();
// 	}, [messages]);

// 	const scrollToBottom = () => {
// 		chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
// 	};

// 	const {mutate, isPending} = useMutation({
// 		mutationFn: chat,
// 	});

// 	const handleSend = (customInput?: string) => {
// 		const messageToSend = customInput ?? input;
// 		if (!messageToSend.trim()) return;

// 		const userMessage: Message = {sender: 'user', text: messageToSend};
// 		setMessages((prev) => {
// 			const hasMatch = messages.some(
// 				(obj: Message) => obj.text === userMessage.text
// 			);
// 			if (hasMatch) {
// 				return [...prev];
// 			}
// 			return [...prev, userMessage];
// 		});
// 		setInput('');

// 		mutate(messageToSend, {
// 			onError(error: any) {
// 				const message =
// 					error?.response?.data?.message ||
// 					error.message ||
// 					'Something went wrong';
// 				setMessages((prev) =>
// 					prev.map((msg, i) =>
// 						i === prev.length - 1 && msg.sender === 'user'
// 							? {...msg, error: message}
// 							: msg
// 					)
// 				);
// 			},
// 			onSuccess(data: any) {
// 				const botMessage: Message = {
// 					sender: 'bot',
// 					text: [...data?.data?.response],
// 				};
// 				setMessages((prev) => [...prev, botMessage]);
// 			},
// 		});
// 	};

// 	return (
// 		<div className="lg:grid lg:grid-cols-4">
// 			<div className="col-span-1 border-r-2 border-card h-screen hidden lg:block"></div>
// 			<div className="flex flex-col h-screen bg-card col-span-3">
// 				{/* Header */}
// 				<header className="px-6 py-4 border-b border-border text-lg font-semibold bg-background">
// 					KIRA Chat 🤖
// 				</header>

// 				{/* Chat content */}
// 				<main className="flex-1 overflow-y-auto px-4 lg:px-32 py-6 space-y-4">
// 					{messages.length === 0 ? (
// 						<div className="flex h-full items-center justify-center text-center text-xl text-muted-foreground">
// 							<div className="space-y-4">
// 								<h1 className="text-xl lg:text-3xl">
// 									Hello there😎❤️. I&#39;m KIRA.
// 								</h1>

// 								<p className="text-center text-xl">
// 									How can i assist you today?
// 								</p>
// 							</div>
// 						</div>
// 					) : (
// 						messages.map((msg, i) => (
// 							<div
// 								key={i}
// 								className={`flex ${
// 									msg.sender === 'user'
// 										? 'justify-end'
// 										: 'justify-start'
// 								}`}
// 							>
// 								<div
// 									className={`rounded-xl px-4 py-3 text-sm max-w-[85%] ${
// 										msg.sender === 'user'
// 											? 'bg-blue-600 text-white'
// 											: 'bg-muted text-foreground'
// 									}`}
// 								>
// 									{msg.text}
// 								</div>
// 							</div>
// 						))
// 					)}
// 					{isPending && (
// 						<div className="flex justify-start">
// 							<div className="rounded-xl px-4 py-3 text-sm bg-muted text-foreground animate-pulse">
// 								KIRA is typing...
// 							</div>
// 						</div>
// 					)}
// 					<div ref={chatEndRef} />
// 				</main>

// 				{/* Input area */}
// 				<footer className="px-6 py-4 border-t border-border bg-background">
// 					<div className="flex items-end gap-2">
// 						<textarea
// 							ref={inputRef}
// 							rows={1}
// 							value={input}
// 							disabled={isPending}
// 							placeholder="Type your message..."
// 							className="flex-1 resize-none rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground"
// 							onChange={(e) => setInput(e.target.value)}
// 							onKeyDown={(e) => {
// 								if (e.key === 'Enter' && !e.shiftKey) {
// 									e.preventDefault();
// 									handleSend();
// 								}
// 							}}
// 						/>
// 						<button
// 							disabled={isPending}
// 							className="bg-foreground text-card rounded-xl px-4 py-3 disabled:opacity-50"
// 							onClick={() => handleSend()}
// 						>
// 							Send
// 						</button>
// 					</div>
// 				</footer>
// 			</div>
// 		</div>
// 	);
// }
