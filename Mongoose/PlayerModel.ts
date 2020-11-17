import { model, Schema } from 'mongoose';
import { IPlayerDocument } from '../DomainObjects/Mongoose/PlayerDocuments';

const PlayerSchema = new Schema({
  socketId: String,
  name: String,
  role: String,
  isAlive: { type: Boolean, default: true },
  connected: { type: Boolean, default: true },
  nominatedBy: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
});

const PlayerModel = model<IPlayerDocument>(`Player`, PlayerSchema);

export default PlayerModel;
