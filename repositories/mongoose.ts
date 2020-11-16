import { Schema, model, Document } from 'mongoose';

const PlayerSchema = new Schema({
  socketId: String,
  name: String,
  role: String,
  isAlive: { type: Boolean, default: true },
  connected: { type: Boolean, default: true },
  nominatedBy: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
});

const StageSchema = {
  intro: { type: Boolean, default: true },
  mafiaAwake: { type: Boolean, default: false },
  detectiveAwake: { type: Boolean, default: false },
  guardianAngelAwake: { type: Boolean, default: false },
  day: { type: Boolean, default: false },
};

const GameSchema = new Schema({
  players: [{ type: Schema.Types.ObjectId, ref: `Player` }],
  gameId: String,
  stages: StageSchema,
  nominatedPlayer: { type: Schema.Types.ObjectId, ref: `Player` },
  lastPlayerKilled: { type: Schema.Types.ObjectId, ref: `Player` },
});

export type Player = {
  _id: Schema.Types.ObjectId;
  socketId: string;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominatedBy?: Player[];
  connected?: boolean;
};

type Stages = {
  intro: boolean;
  mafiaAwake: boolean;
  detectiveAwake: boolean;
  guardianAngelAwake: boolean;
  day: boolean;
};

export interface IGamesDocument extends Document {
  players: Schema.Types.ObjectId[] | Player[];
  gameId: string;
  stages: Stages;
  lastPlayerKilled: Player;
  nominatedPlayer: Player;
}

export type ILeanGamesDocument = Pick<
  IGamesDocument,
  | 'players'
  | 'gameId'
  | 'stages'
  | 'lastPlayerKilled'
  | '_id'
  | 'nominatedPlayer'
>;

export type ILeanPlayerDocument = Pick<
  IPlayerDocument,
  '_id' | 'socketId' | 'name' | 'role' | 'isAlive' | 'nominatedBy' | 'connected'
>;

export interface IPlayerDocument extends Document {
  _id: Schema.Types.ObjectId;
  socketId: string;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominatedBy?: Schema.Types.ObjectId[] | Player[];
  connected?: boolean;
}

export const GamesModel = model<IGamesDocument>(`Game`, GameSchema);
export const PlayerModel = model<IPlayerDocument>(`Player`, PlayerSchema);
