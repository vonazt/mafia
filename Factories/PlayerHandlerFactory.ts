import PlayerService, { IPlayerService } from '../Services/PlayerService';
import PlayerRepository, {
  IPlayerRepository,
} from '../Repositories/PlayerRepository';
import GameModel from '../Mongoose/GameModel';
import PlayerModel from '../Mongoose/PlayerModel';
import GameRepository, { IGameRepository } from '../Repositories/GameRepository';

export default class PlayerHandlerFactory {
  public static build = (): IPlayerService => {
    const gameRepository: IGameRepository = new GameRepository(GameModel);
    const playerRepository: IPlayerRepository = new PlayerRepository(PlayerModel);

    return new PlayerService(playerRepository, gameRepository);
  };
}
