import { Schema, Document } from 'mongoose';
import { Player } from '../Player';

export interface IPlayerDocument extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominatedBy?: Player[];
  connected?: boolean;
}


export type LeanPlayerDocument = Pick<
  IPlayerDocument,
  '_id' | 'name' | 'role' | 'isAlive' | 'nominatedBy' | 'connected'
>;
