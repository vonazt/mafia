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
  ) => Promise<LeanPlayerDocument[]>;
  reconnect: (player: Player, socketId: string) => Promise<LeanPlayerDocument>;
  disconnectFromGame: (socketId: string) => Promise<LeanPlayerDocument>;
}

export default class PlayerRepository implements IPlayerRepository {
  constructor(public PlayerModel: Model<IPlayerDocument>) {}

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

  public reconnect = async (
    player: Player,
    socketId: string,
  ): Promise<LeanPlayerDocument> => this.updateById(player._id, { socketId });

  public disconnectFromGame = async (
    socketId: string,
  ): Promise<LeanPlayerDocument> => {
    console.log('disconnecting socket id is', socketId);
    const updatedPlayer = await this.updatePlayer(
      { socketId },
      { connected: false, socketId: null },
    );
    console.log('updated player is', updatedPlayer);
    return updatedPlayer;
  };

  public updateNominations = async (
    playerToNominate: Player,
    nominatedBy: Player,
  ): Promise<LeanPlayerDocument[]> =>
    Promise.all([
      this.updatePlayer(
        { nominatedBy: nominatedBy._id },
        { $pull: { nominatedBy: nominatedBy._id } },
      ),
      this.updateById(playerToNominate._id, {
        $addToSet: { nominatedBy: nominatedBy._id },
      }),
    ]);

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
