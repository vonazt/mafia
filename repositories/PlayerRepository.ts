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
    playerToNominateId: string,
    nominatedById: string,
  ) => Promise<LeanPlayerDocument[]>;
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

  public updateNominations = async (
    playerToNominateId: string,
    nominatedById: string,
  ): Promise<LeanPlayerDocument[]> =>
    Promise.all([
      this.updatePlayer(
        { nominatedBy: nominatedById },
        { $pull: { nominatedBy: nominatedById } },
      ),
      this.updateById(playerToNominateId, {
        $addToSet: { nominatedBy: nominatedById },
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
