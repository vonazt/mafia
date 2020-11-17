import { Schema, Document } from 'mongoose';
import { Player } from '../Player';

export interface IPlayerDocument extends Document {
  _id: Schema.Types.ObjectId;
  socketId: string;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominatedBy?: Player[];
  connected?: boolean;
}
