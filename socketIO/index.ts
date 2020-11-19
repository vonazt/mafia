import ioserver, { Socket } from 'socket.io';
import { IGameHandler } from '../Handlers/GameHandler';
import GameHandlerFactory from '../Factories/GameHandlerFactory';
import { IPlayerHandler } from '../Handlers/PlayerHandler';
import PlayerHandlerFactory from '../Factories/PlayerHandlerFactory';

const sockets = (router: any, io: ioserver.Server) => (
  socket: Socket,
  next: Function,
) => {
  console.log('herererer');
  const gameHandler: IGameHandler = GameHandlerFactory.build(io, socket);

  const playerHandler: IPlayerHandler = PlayerHandlerFactory.build(io, socket);

  const player = JSON.parse(socket.handshake.query.player);

  console.log(
    `player ${player?.name} connected with socket id ${player?.socketId}, new socket id is ${socket.id}`,
  );

  if (
    (player && player?.socketId === null) ||
    (player?._id && player?.socketId !== socket.id)
  ) {
    console.log(
      `reconnecting player ${player.name} to ${socket.id} from old socket ${player.socketId}`,
    );
    playerHandler.reconnect(player, socket.id);
  }

  socket.on(`create`, gameHandler.create);

  socket.on(`join`, gameHandler.join);

  socket.on(`add`, playerHandler.add);

  socket.on(`start`, gameHandler.start);

  socket.on(`assassinate`, playerHandler.assassinate);

  socket.on(`confirmAssassination`, playerHandler.confirmAssassination);

  socket.on(`investigate`, playerHandler.investigate);

  socket.on(`endDetectiveTurn`, gameHandler.endDetectiveTurn);

  socket.on(`nominate`, playerHandler.nominate);

  socket.on(`lynch`, playerHandler.lynch);

  socket.on(`disconnect`, playerHandler.disconnect);

  socket.on(`quit`, gameHandler.quit);

  next();
};

export default sockets;
