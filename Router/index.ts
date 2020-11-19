import { Application, Router } from 'express';
import { Namespace, Server, Socket } from 'socket.io';
import { IGameHandler } from '../Handlers/GameHandler';
import GameHandlerFactory from '../Factories/GameHandlerFactory';
import { IPlayerHandler } from '../Handlers/PlayerHandler';
import PlayerHandlerFactory from '../Factories/PlayerHandlerFactory';

import sockets from '../socketIO';

const routes = (router: any, io: any) => (req: any, res: any, next: any) => {


  // const io = req.app.get('io');
  // const socket = req.app.get('socket');

  console.log('socket in route is', socket.id);

  // console.log('herererer');
  const gameHandler: IGameHandler = GameHandlerFactory.build(io, socket);

  const playerHandler: IPlayerHandler = PlayerHandlerFactory.build(io, socket);

  // const player = JSON.parse(socket.handshake.query.player);

  // console.log(
  //   `player ${player?.name} connected with socket id ${player?.socketId}, new socket id is ${socket.id}`,
  // );

  router.post(`/create`, gameHandler.create)

  router.post(`/join`, gameHandler.join)

  router.put(`/:gameId/players`, playerHandler.add)

  // if (
  //   (player && player?.socketId === null) ||
  //   (player?._id && player?.socketId !== socket.id)
  // ) {
  //   console.log(
  //     `reconnecting player ${player.name} to ${socket.id} from old socket ${player.socketId}`,
  //   );
  //   playerHandler.reconnect(player, socket.id);
  // }

  // socket.on(`add`, playerHandler.add);

  // socket.on(`start`, gameHandler.start);

  // socket.on(`assassinate`, playerHandler.assassinate);

  // socket.on(`confirmAssassination`, playerHandler.confirmAssassination);

  // socket.on(`investigate`, playerHandler.investigate);

  // socket.on(`endDetectiveTurn`, gameHandler.endDetectiveTurn);

  // socket.on(`nominate`, playerHandler.nominate);

  // socket.on(`lynch`, playerHandler.lynch);

  socket.on(`disconnect`, () => console.log('disconnecting', socket.id));

  // socket.on(`quit`, gameHandler.quit);

  next();
  // });
  // console.log('route ier ', router)

  // next()

  // next();
  // io.use((socket, next) => {
  //   console.log('socket is', socket.id);
  //   // const router = Router();
  //   // console.log('req is', req.body);

  //   next();
  // });
  // next();
};
export default routes;
