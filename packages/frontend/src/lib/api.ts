import {
    RegisterInput,
    CreateChatSchema,
    InviteToChatSchema,
    CreateChatSchemaType,
    InviteToChatSchemaType,
    Chat
} from 'shared';

const API_URL = 'http://localhost:4000';

export const register = (data: RegisterInput) =>
    fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

export const login = (data: RegisterInput) =>
    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

export const createChat = (data: CreateChatSchemaType, token: string) =>
    fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

export const getChats = (token: string): Promise<Chat[]> =>
    fetch(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());

export const getChat = (chatId: number, token: string): Promise<Chat> =>
    fetch(`${API_URL}/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());

export const inviteToChat = (chatId: number, username: string, token: string) =>
    fetch(`${API_URL}/chats/${chatId}/invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
    });