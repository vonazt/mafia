import GameService, { IGameService } from '../Services/GameService';
import GameRepository, {
  IGameRepository,
} from '../Repositories/GameRepository';
import GameModel from '../Mongoose/GameModel';
import PlayerRepository, { IPlayerRepository } from '../Repositories/PlayerRepository';
import PlayerModel from '../Mongoose/PlayerModel';

export default class GameHandlerFactory {
  public static build = (): IGameService => {
    const playerRepository: IPlayerRepository = new PlayerRepository(PlayerModel)
    const gameRepository: IGameRepository = new GameRepository(GameModel);
    return new GameService(gameRepository, playerRepository);
  };
}
