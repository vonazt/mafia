import { Player } from '../DomainObjects/Player';
import { Socket, Server } from 'socket.io';
import { IGameService } from '../Services/GameService';
import { LeanPlayerDocument } from '../DomainObjects/Mongoose/PlayerDocuments';
import { IPlayerService } from '../Services/PlayerService';
import { LeanGameDocument } from '../DomainObjects/Mongoose/GameDocuments';

export interface IPlayerHandler {
  add: (gameId: string, player: Player) => Promise<void>;
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
  disconnect: () => Promise<void>;
  quit: () => Promise<void>;
}

export default class PlayerHandler implements IPlayerHandler {
  constructor(
    private io: Server,
    private socket: Socket,
    private playerService: IPlayerService,
  ) {}

  public add = async (gameId: string, player: Player): Promise<void> => {
    const { players }: LeanGameDocument = await this.playerService.add(
      gameId,
      player,
      this.socket.id,
    );
    this.io.to(gameId).emit(`addedPlayer`, players);
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
    const isMafia: boolean = await this.playerService.investigate(playerToInvestigate);
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

  public disconnect = async () => {
    await this.playerService.disconnectFromGame(this.socket.id);
    return;
  };

  public quit = async () => {
    await this.playerService.quit(this.socket.id);
    return;
  };
}
