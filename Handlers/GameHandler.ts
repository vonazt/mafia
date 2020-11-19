import {
  IGameDocument,
  LeanGameDocument,
} from '../DomainObjects/Mongoose/GameDocuments';
import { Socket, Server } from 'socket.io';
import { IGameService } from '../Services/GameService';
import { Player } from '../DomainObjects/Player';
import { Request, Response } from 'express';

export interface IGameHandler {
  create: (req: Request, res: Response) => Promise<void>;
  join: (req: Request, res: Response) => Promise<void>;
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
  public create = async (req: Request, res: Response): Promise<void> => {
    const game: IGameDocument = await this.gameService.create();
    this.socket.join(game.gameId);
    res.send(game);
  };

  public join = async (req: Request, res: Response): Promise<void> => {
    const { gameId } = req.body;
    const game: LeanGameDocument = await this.gameService.join(gameId);
    // console.log('game is', game)
    this.socket.join(game?.gameId);
    res.status(200).send(game);
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
