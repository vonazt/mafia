import { Schema, model, Document } from 'mongoose';

const PlayerSchema = new Schema({
  socketId: String,
  name: String,
  role: String,
  isAlive: { type: Boolean, default: true },
  connected: { type: Boolean, default: true },
  nominatedBy: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
});

const GameSchema = new Schema({
  players: [PlayerSchema],
  gameId: String,
  stageComplete: { type: Boolean, default: false },
  lastPlayerKilled: PlayerSchema,
});

export type Player = {
  _id: string;
  socketId: string;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominatedBy?: Player[];
  connected?: boolean;
};

export interface IGamesDocument extends Document {
  players: Player[];
  gameId: string;
  stageComplete: boolean;
  lastPlayerKilled: Player;
}

export type IUpdateGamesDocument = Pick<
  IGamesDocument,
  'players' | 'gameId' | 'stageComplete' | 'lastPlayerKilled'
>;

export interface IPlayerDocument extends Document {
  _id: string;
  socketId: string;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominatedBy?: Player[];
  connected?: boolean;
}

export const GamesModel = model<IGamesDocument>(`Game`, GameSchema);
export const PlayerModel = model<IPlayerDocument>(`Player`, PlayerSchema)
