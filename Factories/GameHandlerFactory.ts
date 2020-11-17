import { Socket, Server } from 'socket.io';
import GameHandler, { IGameHandler } from '../Handlers/GameHandler';
import GameService, { IGameService } from '../services/GameService';
import GameRepository, {
  IGameRepository,
} from '../repositories/GameRepository';
import GameModel from '../Mongoose/GameModel';
import PlayerModel from '../Mongoose/PlayerModel';

export default class GameHandlerFactor {
  public static build = (io: Server, socket: Socket): IGameHandler => {
    // const playerRepository: IPlayerRepository = new PlayerRepository()
    const gameRepository: IGameRepository = new GameRepository(GameModel, PlayerModel);
    const gameService: IGameService = new GameService(gameRepository);

    return new GameHandler(io, socket, gameService);
  };
}
