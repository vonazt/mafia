import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import ioserver, { Socket } from 'socket.io';

dotenv.config();

const app = express();

const server = require('http').Server(app);

const io = ioserver(server);

const clients: { [key: string]: any } = {};
const users: { [key: string]: any } = {};

let count: number = 0;

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  socket.on('join', (name) => {
    count++;
    console.log('user joined', name);
    users[name] = socket.id;
    clients[socket.id] = socket;
    console.log('count', count);
    if (count > 1) {
      io.to(users['richard']).emit(`message`, "Hello Alex, how've you been");
    }
  });

});

app.use(cors());

app.use(express.static('public'));
app.get('*', (req: Request, res: Response) => {
  console.log('sigh');
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

server.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}`);
});
