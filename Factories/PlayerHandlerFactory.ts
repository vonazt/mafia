import { Socket, Server } from 'socket.io';
import PlayerHandler, { IPlayerHandler } from '../Handlers/PlayerHandler';
import PlayerService, { IPlayerService } from '../Services/PlayerService';
import PlayerRepository, {
  IPlayerRepository,
} from '../Repositories/PlayerRepository';
import GameModel from '../Mongoose/GameModel';
import PlayerModel from '../Mongoose/PlayerModel';
import GameRepository, { IGameRepository } from '../Repositories/GameRepository';

export default class PlayerHandlerFactory {
  public static build = (): IPlayerHandler => {
    const gameRepository: IGameRepository = new GameRepository(GameModel);
    const playerRepository: IPlayerRepository = new PlayerRepository(PlayerModel);
    const playerService: IPlayerService = new PlayerService(playerRepository, gameRepository);

    return new PlayerHandler(playerService);
  };
}
