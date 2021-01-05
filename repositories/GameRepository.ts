import { Player } from '../DomainObjects/Player';
import { Model } from 'mongoose';
import {
  IGameDocument,
  LeanGameDocument,
} from '../DomainObjects/Mongoose/GameDocuments';

export interface IGameRepository {
  getById: (gameId: string) => Promise<LeanGameDocument>;
  create: () => Promise<IGameDocument>;
  update: (gameId: string, operation: {}) => Promise<LeanGameDocument>;
  join: (gameId: string) => Promise<LeanGameDocument>;
  listPlayersInGame: (gameId: string) => Promise<Player[]>;
  quit: (socketId: string) => Promise<LeanGameDocument>;
}

export default class GameRepository implements IGameRepository {
  constructor(public GameModel: Model<IGameDocument>) {}

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
    const gameId: string = Math.floor(1000 + Math.random() * 9000).toString();
    const gameToSave: IGameDocument = new this.GameModel({ gameId });
    await gameToSave.save();
    return gameToSave;
  };

  public update = async (
    gameId: string,
    operation: {},
  ): Promise<LeanGameDocument> =>
    this.GameModel.findOneAndUpdate({ gameId }, operation, {
      new: true,
      useFindAndModify: false,
      lean: true
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

  public join = async (gameId: string): Promise<LeanGameDocument> => {
    try {
      const game: LeanGameDocument = await this.getById(gameId);
      return game;
    } catch (err) {
      console.error(`No game found`);
      return null;
    }
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

  public quit = async (socketId: string): Promise<LeanGameDocument> =>
    this.GameModel.findOneAndUpdate(
      { players: { $elemMatch: { socketId } } },
      { $pull: { players: { socketId } } },
      { new: true, lean: true, useFindAndModify: false },
    );
}
