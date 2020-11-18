import ioserver, { Socket } from 'socket.io';
import { IGameHandler } from '../Handlers/GameHandler';
import GameHandlerFactory from '../Factories/GameHandlerFactory';
import { IPlayerHandler } from '../Handlers/PlayerHandler';
import PlayerHandlerFactory from '../Factories/PlayerHandlerFactory';

const sockets = (io: ioserver.Server) => async (
  socket: Socket,
  next: Function,
) => {
  console.log('a user connected', socket.id);

  const gameHandler: IGameHandler = GameHandlerFactory.build(io, socket);

  const playerHandler: IPlayerHandler = PlayerHandlerFactory.build(io, socket);

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
