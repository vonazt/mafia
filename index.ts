import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import ioserver, { Socket } from 'socket.io';

import * as gameService from './services';

dotenv.config();

const connectToMongo = async () => {
  try {
    console.log(`connecting to mongo`);
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@violet.zoqgo.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    console.log(`Connected to MongoDB`);
  } catch (err) {
    console.error(`Error connecting to MongoDB`, err);
  }
};

(async () => connectToMongo())();

const app = express();

const server = require('http').Server(app);

const io = ioserver(server);

io.on('connection', (socket: Socket) => {
  console.log('a user connected');

  socket.on(
    `create`,
    async (): Promise<void> => {
      console.log(`creating game`);
      const gameId = await gameService.createGame();
      console.log('created game', gameId);
      socket.join(gameId);
      io.to(gameId).emit(`createSuccess`, gameId);
    },
  );

  socket.on(
    'join',
    async (gameId: string): Promise<void> => {
      const response = await gameService.joinGame(gameId);
      if (!response) {
        socket.join(gameId);
        io.to(gameId).emit(`noGame`);
      }
      socket.join(response.gameId);
      io.to(gameId).emit(`joinSuccess`, gameId, response.players);
    },
  );

  socket.on(
    'add',
    async (gameId: string, name: string): Promise<void> => {
      const response = await gameService.addPlayer(gameId, name, socket.id);
      console.log('response is', response);
      io.to(gameId).emit(`addedPlayer`, response.players);
    },
  );

  socket.on(`start`, async (gameId: string) => {
    const playerRoles = await gameService.startGame(gameId)
  })
});

app.use(cors());

app.use(express.static('public'));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

server.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}`);
});
