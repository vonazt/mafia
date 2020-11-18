import {
  IGameDocument,
  LeanGameDocument,
} from '../DomainObjects/Mongoose/GameDocuments';
import {
  IPlayerDocument,
  LeanPlayerDocument,
} from '../DomainObjects/Mongoose/PlayerDocuments';
import { Model } from 'mongoose';
import { Player } from '../DomainObjects/Player';

export interface IPlayerRepository {
  getById: (_id: Object, projection: string) => Promise<LeanPlayerDocument>;
  create: (player: Player) => Promise<IPlayerDocument>;
  updateById: (_id: Object, operation: {}) => Promise<LeanPlayerDocument>;
  updateNominations: (
    playerToNominate: Player,
    nominatedBy: Player,
  ) => Promise<void>;
  disconnectFromGame: (socketId: string) => Promise<LeanPlayerDocument>;
}

export default class PlayerRepository implements IPlayerRepository {
  constructor(
    public PlayerModel: Model<IPlayerDocument>,
  ) {}

  public create = async (player: Player): Promise<IPlayerDocument> => {
    const playerToSave: IPlayerDocument = new this.PlayerModel(player);
    await playerToSave.save();
    return playerToSave;
  };

  public updateById = async (
    _id: Object,
    operation: {},
  ): Promise<LeanPlayerDocument> =>
    this.PlayerModel.findByIdAndUpdate({ _id }, operation, {
      useFindAndModify: false,
      new: true,
      lean: true,
    });

  public disconnectFromGame = async (
    socketId: string,
  ): Promise<LeanPlayerDocument> =>
    this.updatePlayer({ socketId }, { connected: false, socketId: null });

  public updateNominations = async (
    playerToNominate: Player,
    nominatedBy: Player,
  ): Promise<void> => {
    await this.updatePlayer(
      { nominatedBy: nominatedBy._id },
      { $pull: { nominatedBy: nominatedBy._id } },
    );
    await this.updateById(playerToNominate._id, {
      $addToSet: { nominatedBy: nominatedBy._id },
    });
  };

  private updatePlayer = async (
    filter: {},
    operation: {},
  ): Promise<LeanPlayerDocument> =>
    this.PlayerModel.findOneAndUpdate(filter, operation, {
      useFindAndModify: false,
      new: true,
      lean: true,
    });

  public getById = async (
    _id: Object,
    projection: string,
  ): Promise<LeanPlayerDocument> =>
    this.PlayerModel.findById({ _id }, projection, { lean: true });
}
