import { Player } from '../DomainObjects/Player';
import { Socket, Server } from 'socket.io';
import { IGameService } from '../Services/GameService';
import { LeanPlayerDocument } from '../DomainObjects/Mongoose/PlayerDocuments';
import { IPlayerService } from '../Services/PlayerService';
import { LeanGameDocument } from '../DomainObjects/Mongoose/GameDocuments';
import { Request, Response } from 'express';

export interface IPlayerHandler {
  add: (req: Request, res: Response, next: Function) => Promise<void>;
  assassinate: (
    player: Player,
    mafiaHitman: Player,
    gameId: string,
  ) => Promise<void>;
  confirmAssassination: (playerToDie: Player, gameId: string) => Promise<void>;
  investigate: (
    playerToInvestigate: Player,
    detectivePlayer: Player,
  ) => Promise<void>;
  nominate: (
    playerToNominate: Player,
    nominatedBy: Player,
    gameId: string,
  ) => Promise<void>;
  lynch: (
    playerToLynch: Player,
    nominatedBy: Player,
    gameId: string,
  ) => Promise<void>;
  reconnect: (player: Player, socketId: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

export default class PlayerHandler implements IPlayerHandler {
  constructor(
    private io: Server,
    private socket: Socket,
    private playerService: IPlayerService,
  ) {}

  public add = async (req: Request, res: Response): Promise<void> => {
    // console.log('req is', req.params);
    const { gameId } = req.params;
    const { player } = req.body;
    const { players }: LeanGameDocument = await this.playerService.add(
      gameId,
      player,
      this.socket.id,
    );
    // console.log('game id is', gameId)
    this.socket.to(gameId).emit(`addedPlayer`, players);
    res.sendStatus(200)
  };

  public assassinate = async (
    player: Player,
    mafiaHitman: Player,
    gameId: string,
  ): Promise<void> => {
    const updatedGame: LeanGameDocument = await this.playerService.assassinate(
      player,
      mafiaHitman,
      gameId,
    );
    const mafia: Player[] = updatedGame.players.filter(
      ({ role }: Player) => role === `mafia`,
    );
    await Promise.all(
      mafia.map(({ socketId }: Player) =>
        this.io.to(socketId).emit(`postAssassination`, updatedGame),
      ),
    );
  };

  public confirmAssassination = async (
    playerToDie: Player,
    gameId: string,
  ): Promise<void> => {
    const updatedGame: LeanGameDocument = await this.playerService.confirmAssassination(
      playerToDie,
      gameId,
    );
    this.io.to(gameId).emit(`detectiveAwake`, updatedGame);
  };

  public investigate = async (
    playerToInvestigate: Player,
    detectivePlayer: Player,
  ): Promise<void> => {
    const isMafia: boolean = await this.playerService.investigate(
      playerToInvestigate,
    );
    console.log('broadcasting to', detectivePlayer.socketId);
    this.io
      .to(detectivePlayer.socketId)
      .emit(`investigationResult`, isMafia, playerToInvestigate);
  };

  public nominate = async (
    playerToNominate: Player,
    nominatedBy: Player,
    gameId: string,
  ): Promise<void> => {
    const updatedGame: LeanGameDocument = await this.playerService.nominate(
      playerToNominate,
      nominatedBy,
      gameId,
    );
    this.io.to(gameId).emit(`postNomination`, updatedGame);
  };

  public lynch = async (
    playerToLynch: Player,
    nominatedBy: Player,
    gameId: string,
  ): Promise<void> => {
    const updatedGame: LeanGameDocument = await this.playerService.lynch(
      playerToLynch,
      nominatedBy,
      gameId,
    );
    this.io.to(gameId).emit(`postLynching`, updatedGame);
  };

  public reconnect = async (player: Player, socketId: string) => {
    const updatedPlayer: Player = await this.playerService.reconnect(
      player,
      socketId,
    );
    console.log(
      `reconnected ${updatedPlayer.name} to socket id ${updatedPlayer.socketId}`,
    );
    this.io.to(updatedPlayer.socketId).emit(`reconnected`, updatedPlayer);
  };

  public disconnect = async () => {
    await this.playerService.disconnectFromGame(this.socket.id);
    return;
  };
}
