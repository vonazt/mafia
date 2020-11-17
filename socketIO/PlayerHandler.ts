import { Player } from '../repositories/mongoose';
import ioserver, { Socket } from 'socket.io';
import * as gameService from '../services';

interface IPlayerHandler {
  add: (gameId: string, player: Player) => Promise<void>;
  assassinate: (
    player: Player,
    mafiaHitman: Player,
    gameId: string,
  ) => Promise<void>;
  confirmKill: (playerToDie: Player, gameId: string) => Promise<void>;
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
  constructor(private io: ioserver.Server, private socket: Socket) {}

  public add = async (gameId: string, player: Player) => {
    const { players } = await gameService.addPlayer(
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
  ) => {
    const updatedGame = await gameService.assassinatePlayer(
      player,
      mafiaHitman,
      gameId,
    );
    const mafia = updatedGame.players.filter(({ role }) => role === `mafia`);
    await Promise.all(
      mafia.map(({ socketId }) =>
        this.io.to(socketId).emit(`postAssassination`, updatedGame),
      ),
    );
  };

  public confirmKill = async (playerToDie: Player, gameId: string) => {
    const updatedGame = await gameService.killPlayer(playerToDie, gameId);
    this.io.to(gameId).emit(`detectiveAwake`, updatedGame);
  };

  public investigate = async (
    playerToInvestigate: Player,
    detectivePlayer: Player,
  ) => {
    const isMafia = await gameService.investigatePlayer(playerToInvestigate);
    this.io
      .to(detectivePlayer.socketId)
      .emit(`investigationResult`, isMafia, playerToInvestigate);
  };

  public nominate = async (
    playerToNominate: Player,
    nominatedBy: Player,
    gameId: string,
  ) => {
    const updatedGame = await gameService.nominatePlayer(
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
  ) => {
    const updatedGame = await gameService.lynchPlayer(
      playerToLynch,
      nominatedBy,
      gameId,
    );
    this.io.to(gameId).emit(`postLynching`, updatedGame);
  };

  public disconnect = async () => {
    await gameService.disconnectPlayerFromGame(this.socket.id);
    return;
  };

  public quit = async () => {
    await gameService.removePlayerFromGame(this.socket.id);
    return;
  };
}
