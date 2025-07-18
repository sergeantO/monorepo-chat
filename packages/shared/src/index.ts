import { z } from 'zod';

// Пользователь
export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
});

// Чат
export const ChatSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  users: z.array(UserSchema),
  messages: z.array(z.any()).optional(),
});

// Сообщение
export const MessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  createdAt: z.iso.datetime(),
  author: UserSchema,
  chatId: z.number(),
});

// REST API схемы
export const RegisterSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const LoginSchema = RegisterSchema;
export const CreateChatSchema = z.object({ name: z.string() });
export const InviteToChatSchema = z.object({ chatId: z.number(), userId: z.number() });

// Socket.io события
export const MessageEventSchema = z.object({
  chatId: z.number(),
  text: z.string(),
});

// Экспорт типов
export type User = z.infer<typeof UserSchema>;
export type Chat = z.infer<typeof ChatSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type MessageEvent = z.infer<typeof MessageEventSchema>;
export type CreateChatSchemaType = z.infer<typeof CreateChatSchema>;
export type InviteToChatSchemaType = z.infer<typeof InviteToChatSchema>;
