import { Player } from '../DomainObjects/Player';
import { Model } from 'mongoose';
import {
  IGameDocument,
  LeanGameDocument,
} from '../DomainObjects/Mongoose/GameDocuments';
import { IPlayerDocument } from '../DomainObjects/Mongoose/PlayerDocuments';

export interface IGameRepository {
  create: () => Promise<IGameDocument>;
  join: (gameId: string) => Promise<Player[]>;
  start: (gameId: string, players: Player[]) => Promise<LeanGameDocument>;
  listPlayersInGame: (gameId: string) => Promise<Player[]>;
}

class SharedRepositoryMethods {
  constructor(
    public GameModel: Model<IGameDocument>,
    public PlayerModel: Model<IPlayerDocument>,
  ) {}

  public updatePlayerById = async (_id: Object, operation: {}) =>
    this.PlayerModel.findByIdAndUpdate({ _id }, operation, {
      useFindAndModify: false,
      new: true,
      lean: true,
    });

  public updateGame = async (gameId: string, operation: {}) =>
    this.GameModel.findOneAndUpdate({ gameId }, operation, {
      new: true,
      useFindAndModify: false,
    })
      .populate(`players`)
      .populate({
        path: 'players',
        populate: {
          path: 'nominatedBy',
          model: 'Player',
        },
      })
      .populate(`lastPlayerKilled`)
      .populate(`nominatedPlayers`);
}

export default class GameRepository
  extends SharedRepositoryMethods
  implements IGameRepository {
  constructor(
    public GameModel: Model<IGameDocument>,
    public PlayerModel: Model<IPlayerDocument>,
  ) {
    super(GameModel, PlayerModel);
  }

  public getById = async (gameId: string): Promise<LeanGameDocument> =>
    this.GameModel.findOne({ gameId }, null, { lean: true })
      .populate(`players`)
      .populate({
        path: 'players',
        populate: {
          path: 'nominatedBy',
          model: 'Player',
        },
      })
      .populate(`lastPlayerKilled`)
      .populate(`nominatedPlayers`);

  public create = async (): Promise<IGameDocument> => {
    const gameId = Math.floor(1000 + Math.random() * 9000).toString();
    const gameToSave = new this.GameModel({ gameId });
    await gameToSave.save();
    return gameToSave;
  };

  public join = async (gameId: string): Promise<Player[]> => {
    try {
      const { players } = await this.getById(gameId);
      return players;
    } catch (err) {
      console.error(`No game found`);
      return null;
    }
  };

  public start = async (
    gameId: string,
    players: Player[],
  ): Promise<LeanGameDocument> => {
    await Promise.all(
      players.map(({ _id, role }) => this.updatePlayerById(_id, { role })),
    );
    return this.updateGame(gameId, {
      players: players.map(({ _id }) => _id),
      $set: { 'stages.intro': false, 'stages.mafiaAwake': true },
    });
  };

  public listPlayersInGame = async (gameId: string): Promise<Player[]> => {
    try {
      const { players }: LeanGameDocument = await this.getById(gameId);
      return players;
    } catch (err) {
      console.error(`No game found`);
      return null;
    }
  };
}
