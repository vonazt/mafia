import ioserver, { Socket } from 'socket.io';
import{ IGameHandler } from '../Handlers/GameHandler';
import GameHandlerFactory from '../Factories/GameHandlerFactory';
import PlayerHandler from './PlayerHandler';
// import { Player } from '../repositories/mongoose';

const sockets = (io: ioserver.Server) => async (
  socket: Socket,
  next: Function,
) => {
  console.log('a user connected', socket.id);

  const gameHandler: IGameHandler = GameHandlerFactory.build(io, socket);

  const playerHandler = new PlayerHandler(io, socket);

  socket.on(`create`, async (): Promise<void> => gameHandler.create());

  socket.on(
    `join`,
    async (gameId: string): Promise<void> => gameHandler.join(gameId),
  );

  // socket.on(`add`, async (gameId: string, player: Player) =>
  //   playerHandler.add(gameId, player),
  // );

  // socket.on(`start`, async (gameId: string) => gameHandler.start(gameId));

  // socket.on(
  //   `assassinate`,
  //   async (player: Player, mafiaHitman: Player, gameId: string) =>
  //     playerHandler.assassinate(player, mafiaHitman, gameId),
  // );

  // socket.on(
  //   `confirmKill`,
  //   async (playerToDie: Player, gameId: string): Promise<void> =>
  //     playerHandler.confirmKill(playerToDie, gameId),
  // );

  // socket.on(
  //   `investigate`,
  //   async (
  //     playerToInvestigate: Player,
  //     detectivePlayer: Player,
  //   ): Promise<void> =>
  //     playerHandler.investigate(playerToInvestigate, detectivePlayer),
  // );

  // socket.on(
  //   `endDetectiveTurn`,
  //   async (gameId: string): Promise<void> =>
  //     gameHandler.endDetectiveTurn(gameId),
  // );

  // socket.on(
  //   `nominate`,
  //   async (
  //     playerToNominate: Player,
  //     nominatedBy: Player,
  //     gameId: string,
  //   ): Promise<void> =>
  //     playerHandler.nominate(playerToNominate, nominatedBy, gameId),
  // );

  // socket.on(
  //   `lynch`,
  //   async (playerToLynch: Player, nominatedBy: Player, gameId: string) =>
  //     playerHandler.lynch(playerToLynch, nominatedBy, gameId),
  // );

  // socket.on(
  //   `disconnect`,
  //   async (): Promise<void> => playerHandler.disconnect(),
  // );

  // socket.on(`quit`, async (): Promise<void> => playerHandler.quit());

  next();
};

export default sockets;
