import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import ioserver, { Socket } from 'socket.io';

import * as gameService from './services';
import { Player } from './repositories/mongoose';

dotenv.config();

export const connectToMongo = async () => {
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
  console.log('a user connected', socket.id);

  socket.on(
    `create`,
    async (): Promise<void> => {
      const game = await gameService.createGame();
      socket.join(game.gameId);
      io.to(game.gameId).emit(`createSuccess`, game);
    },
  );

  socket.on(
    'join',
    async (gameId: string): Promise<void> => {
      const players = await gameService.joinGame(gameId);
      if (!players) {
        socket.join(gameId);
        io.to(gameId).emit(`noGame`);
      }
      socket.join(gameId);
      io.to(gameId).emit(`joinSuccess`, gameId, players);
    },
  );

  socket.on(
    'add',
    async (gameId: string, player: Player): Promise<void> => {
      const { players } = await gameService.addPlayer(
        gameId,
        player,
        socket.id,
      );
      io.to(gameId).emit(`addedPlayer`, players);
    },
  );

  socket.on(
    `start`,
    async (gameId: string): Promise<void> => {
      const { players, stages } = await gameService.startGame(gameId);
      await Promise.all(
        (players as Player[]).map((player) => {
          if (player.role === `mafia`) {
            const otherMafia = (players as Player[])
              .filter(
                (otherPlayer) =>
                  otherPlayer.socketId !== player.socketId &&
                  otherPlayer.role === `mafia`,
              )
              .map(({ name }) => name);
            io.to(player.socketId).emit(
              `assignedRoles`,
              player.role,
              otherMafia,
            );
          }
          io.to(player.socketId).emit(`assignedRoles`, player.role);
        }),
      );
      io.to(gameId).emit(`gameStarted`, stages);
    },
  );

  socket.on(
    `assassinate`,
    async (
      player: Player,
      mafiaHitman: Player,
      gameId: string,
    ): Promise<void> => {
      const updatedGame = await gameService.assassinatePlayer(
        player,
        mafiaHitman,
        gameId,
      );
      const mafia = (updatedGame.players as Player[]).filter(
        ({ role }) => role === `mafia`,
      );
      await Promise.all(
        mafia.map(({ socketId }) =>
          io.to(socketId).emit(`postAssassination`, updatedGame),
        ),
      );
    },
  );

  socket.on(
    `confirmKill`,
    async (playerToDie: Player, gameId: string): Promise<void> => {
      const updatedGame = await gameService.killPlayer(playerToDie, gameId);
      io.to(gameId).emit(`detectiveAwake`, updatedGame);
    },
  );

  socket.on(
    `investigate`,
    async (
      playerToInvestigate: Player,
      detectivePlayer: Player,
    ): Promise<void> => {
      const isMafia = await gameService.investigatePlayer(playerToInvestigate);
      io.to(detectivePlayer.socketId).emit(
        `investigationResult`,
        isMafia,
        playerToInvestigate,
      );
    },
  );

  socket.on(
    `endDetectiveTurn`,
    async (gameId: string): Promise<boolean> => {
      const updatedGame = await gameService.endDetectiveTurn(gameId);
      if (updatedGame.stages.guardianAngelAwake) {
        const guardianAngelPlayer = (updatedGame.players as Player[]).find(
          ({ role }) => role === `guardianAngel`,
        );
        return io
          .to(guardianAngelPlayer.socketId)
          .emit(`guardianAngelAwake`, updatedGame.stages);
      } else io.to(gameId).emit(`day`, updatedGame);
    },
  );

  socket.on(
    `nominate`,
    async (
      playerToNominate: Player,
      nominatedBy: Player,
      gameId: string,
    ): Promise<void> => {
      const updatedGame = await gameService.nominatePlayer(
        playerToNominate,
        nominatedBy,
        gameId,
      );
      io.to(gameId).emit(`postNomination`, updatedGame);
    },
  );

  socket.on(
    `lynch`,
    async (playerToLynch: Player, nominatedBy: Player, gameId: string) => {
      const updatedGame = await gameService.lynchPlayer(
        playerToLynch,
        nominatedBy,
        gameId,
      );
      io.to(gameId).emit(`postLynching`, updatedGame)
    },
  );

  socket.on(
    `disconnect`,
    async (): Promise<void> => {
      await gameService.disconnectPlayerFromGame(socket.id);
    },
  );

  socket.on(
    `quit`,
    async (): Promise<void> => {
      await gameService.removePlayerFromGame(socket.id);
      return;
    },
  );
});

app.use(cors());

app.use(express.static('public'));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

server.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}`);
});
