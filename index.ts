import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import ioserver, { Socket } from 'socket.io';
import connectToMongo from './mongo';
import sockets from './socketIO';
import routes from './Router';

dotenv.config();

connectToMongo();

const app = express();

const server = require('http').Server(app);

const io = ioserver(server);

const router = Router();

io.listen(server);

// io.on(`connection`, (socket: Socket) => {
//   console.log('io at  base', socket.id);
//   app.set('socket', socket);

// });

// app.set('io', io);

app.use(function (req: any, res: any, next: any) {
  req.io = io;
  next();
});

app.use(cors());

app.use(bodyParser.json());
app.use('/api', router.use(routes(router, io)));
app.use(express.static('public'));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

server.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}`);
});
