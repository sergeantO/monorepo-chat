import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { MessageEventSchema, RegisterInput } from 'shared';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// JWT middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized');

    try {
        (req as any).user = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        next();
    } catch {
        res.status(401).send('Invalid token');
    }
};

// REST API
app.post('/register', async (req, res) => {
    const { username, password }: RegisterInput = req.body;
    const user = await prisma.user.create({
        data: { username, password }
    });
    res.json(user);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });

    if (user && user.password === password) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Получение списка чатов пользователя
app.post('/chats', authenticate, async (req, res) => {
    const chat = await prisma.chat.create({
        data: {
            name: req.body.name,
            users: { connect: { id: (req as any).user.id } }
        },
        include: {
            users: true
        }
    });
    res.json(chat);
});

// Получение списка чатов пользователя
app.get('/chats', authenticate, async (req, res) => {
    const chats = await prisma.chat.findMany({
        where: {
            users: {
                some: { id: (req as any).user.id }
            }
        },
        include: {
            users: true
        }
    });
    res.json(chats);
});

// Получение информации о чате
app.get('/chats/:id', authenticate, async (req, res) => {
    const chatId = parseInt(req.params.id);
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
            users: true,
            messages: {
                include: { author: true }
            }
        }
    });

    if (!chat) return res.status(404).send('Chat not found');
    res.json(chat);
});

// Приглашение пользователя в чат
app.post('/chats/:chatId/invite', authenticate, async (req, res) => {
    const chatId = parseInt(req.params.chatId);
    const { username } = req.body;

    // Проверка что текущий пользователь участник чата
    const chat = await prisma.chat.findFirst({
        where: {
            id: chatId,
            users: { some: { id: (req as any).user.id } }
        }
    });

    if (!chat) return res.status(403).send('Forbidden');

    // Поиск пользователя по имени
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).send('User not found');

    // Добавление пользователя в чат
    await prisma.chat.update({
        where: { id: chatId },
        data: { users: { connect: { id: user.id } } }
    });

    res.send('User invited');
});
    

// Socket.IO
io.use((socket, next) => {
    console.log(socket)
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
        socket.data.user = jwt.verify(token, process.env.JWT_SECRET!);
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    console.log(`connection`)

    socket.on('joinChat', (chatId: number) => {
        console.log(`joinChat ${chatId}`)
        socket.join(`chat_${chatId}`);
    });

    socket.on('message', async (rawData: unknown) => {
        try {
            const data = MessageEventSchema.parse(rawData);
            console.log(`message ${data.chatId} ${data.text}`)
            const message = await prisma.message.create({
                data: {
                    text: data.text,
                    chatId: data.chatId,
                    authorId: socket.data.user.id,
                },
                include: {
                    author: true
                }
            });
            io.to(`chat_${data.chatId}`).emit('message', message);
        } catch (error) {
            console.error('Invalid message format:', error);
        }
    });
});


// Запуск сервера
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});