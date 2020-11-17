import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import ioserver from 'socket.io';
import connectToMongo from './mongo';
import sockets from './socketIO';

dotenv.config();

connectToMongo();

const app = express();

const server = require('http').Server(app);

const io = ioserver(server);

io.listen(server);

io.use(sockets(io));

app.use(cors());

app.use(express.static('public'));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

server.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}`);
});
