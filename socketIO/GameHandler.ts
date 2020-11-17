import { Player } from '../repositories/mongoose';
import ioserver, { Socket } from 'socket.io';
import * as gameService from '../services';

interface IGameHandler {
  create: () => Promise<void>;
  join: (gameId: string) => Promise<void>;
  start: (gameId: string) => Promise<void>;
  endDetectiveTurn: (gameId: string) => Promise<void>;
}

export default class GameHandler implements IGameHandler {
  constructor(private io: ioserver.Server, private socket: Socket) {}
  public create = async () => {
    const game = await gameService.createGame();
    this.socket.join(game.gameId);
    this.io.to(game.gameId).emit(`createSuccess`, game);
  };

  public join = async (gameId: string) => {
    const players = await gameService.joinGame(gameId);
    if (!players) {
      this.socket.join(gameId);
      this.io.to(gameId).emit(`noGame`);
    }
    this.socket.join(gameId);
    this.io.to(gameId).emit(`joinSuccess`, gameId, players);
  };

  public start = async (gameId: string) => {
    const { players, stages } = await gameService.startGame(gameId);

    await Promise.all(
      players.map((player) => {
        if (player.role === `mafia`) {
          this.broadcastToMafia(players, player);
        }
        this.io.to(player.socketId).emit(`assignedRoles`, player.role);
      }),
    );
    this.io.to(gameId).emit(`gameStarted`, stages);
  };

  public endDetectiveTurn = async (gameId: string) => {
    const updatedGame = await gameService.endDetectiveTurn(gameId);

    if (updatedGame.stages.guardianAngelAwake) {
      const guardianAngelPlayer = updatedGame.players.find(
        ({ role }) => role === `guardianAngel`,
      );
      this.io
        .to(guardianAngelPlayer.socketId)
        .emit(`guardianAngelAwake`, updatedGame.stages);
      return;
    } else this.io.to(gameId).emit(`day`, updatedGame);
  };

  private broadcastToMafia = (players: Player[], player: Player) => {
    const otherMafia = this.getOtherMafia(players, player);
    this.io.to(player.socketId).emit(`assignedRoles`, player.role, otherMafia);
  };

  private getOtherMafia = (players: Player[], player: Player) =>
    players
      .filter(
        ({ socketId, role }) =>
          socketId !== player.socketId && role === `mafia`,
      )
      .map(({ name }) => name);
}
