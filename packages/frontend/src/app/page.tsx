"use client"

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Chat } from 'shared';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [newChatName, setNewChatName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/login');

      const response = await fetch('http://localhost:4000/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    };

    fetchChats();
  }, []);

  const createChat = async () => {
    const token = localStorage.getItem('token');
    if (!token || !newChatName.trim()) return;

    const response = await fetch('http://localhost:4000/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newChatName })
    });

    if (response.ok) {
      const newChat = await response.json();
      setChats([...chats, newChat]);
      setNewChatName('');
    }
  };

  return (
    <div className="container flex flex-col mx-auto p-4 h-screen">
      <h1 className="text-2xl mb-4">Ваши чаты</h1>

      <div className='flex-1'>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map(chat => (
            <div
              key={chat.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/chat/${chat.id}`)}
            >
              <h2 className="text-xl font-bold">{chat.name}</h2>
              <p className="text-gray-600">
                Участников: {chat.users?.length || 0}
              </p>
            </div>
          ))}
        </div>
      </div>


      <div className="mt-4 flex">
        <input
          type="text"
          placeholder="Введите название для нового чата"
          value={newChatName}
          onChange={e => setNewChatName(e.target.value)}
          className="flex-1 py-2 px-4 border rounded"
        />
        <button
          onClick={createChat}
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          Создать чат
        </button>
      </div>
    </div>
  );
}