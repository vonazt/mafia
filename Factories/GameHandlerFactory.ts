import { Socket, Server } from 'socket.io';
import GameHandler, { IGameHandler } from '../Handlers/GameHandler';
import GameService, { IGameService } from '../Services/GameService';
import GameRepository, {
  IGameRepository,
} from '../Repositories/GameRepository';
import GameModel from '../Mongoose/GameModel';
import PlayerRepository, { IPlayerRepository } from '../Repositories/PlayerRepository';
import PlayerModel from '../Mongoose/PlayerModel';

export default class GameHandlerFactor {
  public static build = (io: Server, socket: Socket): IGameHandler => {
    const playerRepository: IPlayerRepository = new PlayerRepository(PlayerModel)
    const gameRepository: IGameRepository = new GameRepository(GameModel);
    const gameService: IGameService = new GameService(gameRepository, playerRepository);

    return new GameHandler(io, socket, gameService);
  };
}
