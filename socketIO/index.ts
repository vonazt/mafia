import ioserver, { Socket } from 'socket.io';
import { IGameHandler } from '../Handlers/GameHandler';
import GameHandlerFactory from '../Factories/GameHandlerFactory';
import { IPlayerHandler } from '../Handlers/PlayerHandler';
import PlayerHandlerFactory from '../Factories/PlayerHandlerFactory';

const sockets = (io: ioserver.Server) => async (
  socket: Socket,
  next: Function,
) => {
  const gameHandler: IGameHandler = GameHandlerFactory.build(io, socket);

  const playerHandler: IPlayerHandler = PlayerHandlerFactory.build(io, socket);

  const player = JSON.parse(socket.handshake.query.player);

  console.log(
    `player ${player?.name} connected with socket id ${player?.socketId}, new socket id is ${socket.id}`,
  );

  if ((player && player?.socketId === null) || (player?._id &&  player?.socketId !== socket.id)) {
    console.log(
      `reconnecting player ${player.name} to ${socket.id} from old socket ${player.socketId}`,
    );
    await playerHandler.reconnect(player, socket.id);
  }

  await socket.on(`create`, gameHandler.create);

  await socket.on(`join`, gameHandler.join);

  await socket.on(`add`, playerHandler.add);

  await socket.on(`start`, gameHandler.start);

  await socket.on(`assassinate`, playerHandler.assassinate);

  await socket.on(`confirmAssassination`, playerHandler.confirmAssassination);

  await socket.on(`investigate`, playerHandler.investigate);

  await socket.on(`endDetectiveTurn`, gameHandler.endDetectiveTurn);

  await socket.on(`nominate`, playerHandler.nominate);

  await socket.on(`lynch`, playerHandler.lynch);

  await socket.on(`disconnect`, playerHandler.disconnect);

  await socket.on(`quit`, gameHandler.quit);

  next();
};

export default sockets;
