"use client"

import { useState, useEffect, use } from 'react';
import { useRouter, useParams  } from "next/navigation";
import { connectSocket, getSocket } from '../../../lib/socket';
import { Message, User, Chat } from 'shared';


export default function ChatPage() {
    const router = useRouter();
    const params = useParams<{ id: string; }>()
    const { id } = params
    const chatId = id ? parseInt(id) : null;

    const [messages, setMessages] = useState<Message[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [inviteUsername, setInviteUsername] = useState('');

    useEffect(() => {
        if (!chatId) return;

        const token = localStorage.getItem('token');
        if (!token) { 
            router.push('/login');
            return
        }

        // Подключаемся к сокету
        const socket = connectSocket(token);

        // Загружаем данные чата
        const fetchChatData = async () => {
            const response = await fetch(`http://localhost:4000/chats/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const chatData = await response.json();
                setChat(chatData);
                setMessages(chatData.messages);
            }
        };

        fetchChatData();

        // Присоединяемся к комнате чата
        console.log('joinChat', chatId)
        socket.emit('joinChat', chatId);

        // Обработчик новых сообщений
        socket.on('message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off('message');
            socket.emit('leaveChat', chatId);
        };
    }, [chatId]);

    const sendMessage = () => {
        if (!chatId || !newMessage.trim()) return;

        const socket = getSocket();
        socket.emit('message', {
            chatId,
            text: newMessage
        });

        setNewMessage('');
    };

    const inviteToChat = async () => {
        if (!chatId || !inviteUsername.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`http://localhost:4000/chats/${chatId}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ username: inviteUsername })
        });

        if (response.ok) {
            setInviteUsername('');
            // Обновляем данные чата
            const updatedResponse = await fetch(`http://localhost:4000/chats/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (updatedResponse.ok) {
                setChat(await updatedResponse.json());
            }
        }
    };

    if (!chat) return <div className="container mx-auto p-4">Загрузка...</div>;

    return (
        <div className="container mx-auto p-4 flex flex-col h-screen py-3">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{chat.name}</h1>
                <button
                    onClick={() => router.push('/')}
                    className="py-2 px-4 bg-gray-200 rounded"
                >
                    К списку чатов
                </button>
            </div>

            {/* Панель приглашения */}
            

            {/* Участники чата */}
            <div className="mt-2">
                <h3 className="text-lg font-semibold mb-2">Участники:</h3>
                <div className="my-2 flex items-center">
                    <input
                        type="text"
                        placeholder="Введите имя пользователя для приглашения"
                        value={inviteUsername}
                        onChange={e => setInviteUsername(e.target.value)}
                        className="flex-1 py-2 px-4 border rounded"
                    />
                    <button
                        onClick={inviteToChat}
                        className="rounded ml-2 px-4 py-2 bg-blue-500 text-white"
                    >
                        Пригласить пользователя
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 py-2">
                    {chat.users.map((user: User) => (
                        <span key={user.id} className="px-3 py-1 bg-gray-200 rounded-full">
                            {user.username}
                        </span>
                    ))}
                </div>
            </div>

            {/* Сообщения */}
            <div className='overflow-y-auto my-2'>
                {messages.map(message => (
                    <div key={message.id} className="mb-3 py-2 px-4 bg-gray-200 rounded">
                        <div className="font-semibold">[{message.author.username}]</div>
                        <div className="">{message.text}</div>
                        <div className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Отправка сообщения */}
            <div className="flex py-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    className="flex-1 py-2 px-4 border rounded"
                    placeholder="Введите сообщение..."
                />
                <button
                    onClick={sendMessage}
                    className="rounded ml-2 px-4 py-2 bg-blue-500 text-white"
                >
                    Отправить
                </button>
            </div>

        </div>
    );
}