import {
  IGameDocument,
  LeanGameDocument,
} from '../DomainObjects/Mongoose/GameDocuments';
import { Socket, Server } from 'socket.io';
import { IGameService } from '../Services/GameService';
import { Player } from '../DomainObjects/Player';

export interface IGameHandler {
  create: () => Promise<void>;
  join: (gameId: string) => Promise<void>;
  start: (gameId: string) => Promise<void>;
  endDetectiveTurn: (gameId: string) => Promise<void>;
  quit: () => Promise<void>;
}

export default class GameHandler implements IGameHandler {
  constructor(
    private io: Server,
    private socket: Socket,
    private gameService: IGameService,
  ) {}
  public create = async (): Promise<void> => {
    const game: IGameDocument = await this.gameService.create();
    this.socket.join(game.gameId);
    this.io.to(game.gameId).emit(`createSuccess`, game);
  };

  public join = async (gameId: string): Promise<void> => {
    const players: Player[] = await this.gameService.join(gameId);
    if (!players) {
      this.socket.join(gameId);
      this.io.to(gameId).emit(`noGame`);
    }
    this.socket.join(gameId);
    this.io.to(gameId).emit(`joinSuccess`, gameId, players);
  };

  public start = async (gameId: string): Promise<void> => {
    const { players, stages }: LeanGameDocument = await this.gameService.start(
      gameId,
    );

    await Promise.all(
      players.map((player: Player) => {
        if (player.role === `mafia`) {
          this.broadcastToMafia(players, player);
        }
        this.io.to(player.socketId).emit(`assignedRoles`, player.role);
      }),
    );
    this.io.to(gameId).emit(`gameStarted`, stages);
  };

  public endDetectiveTurn = async (gameId: string): Promise<void> => {
    const updatedGame: LeanGameDocument = await this.gameService.endDetectiveTurn(
      gameId,
    );

    if (updatedGame.stages.guardianAngelAwake) {
      const guardianAngelPlayer = updatedGame.players.find(
        ({ role }: Player) => role === `guardianAngel`,
      );
      this.io
        .to(guardianAngelPlayer.socketId)
        .emit(`guardianAngelAwake`, updatedGame.stages);
      return;
    } else this.io.to(gameId).emit(`day`, updatedGame);
  };

  public quit = async () => {
    await this.gameService.quit(this.socket.id);
    return;
  };

  private broadcastToMafia = (players: Player[], player: Player): void => {
    const otherMafia: string[] = this.getOtherMafia(players, player);
    this.io.to(player.socketId).emit(`assignedRoles`, player.role, otherMafia);
  };

  private getOtherMafia = (players: Player[], player: Player): string[] =>
    players
      .filter(
        ({ socketId, role }: Player) =>
          socketId !== player.socketId && role === `mafia`,
      )
      .map(({ name }: Player) => name);
}
