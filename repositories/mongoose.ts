import { Schema, model, Document } from 'mongoose';

const PlayerSchema = new Schema({
  socketId: String,
  name: String,
  role: String,
  isAlive: { type: Boolean, default: true },
  connected: { type: Boolean, default: true },
  nominatedBy: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
});

const StageSchema = {
  intro: { type: Boolean, default: true },
  mafiaAwake: { type: Boolean, default: false },
  detectiveAwake: { type: Boolean, default: false },
  guardianAngelAwake: { type: Boolean, default: false },
  day: { type: Boolean, default: false },
};

const GameSchema = new Schema({
  players: [PlayerSchema],
  gameId: String,
  stages: StageSchema,
  nominatedPlayer: PlayerSchema,
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

type Stages = {
  intro: boolean;
  mafiaAwake: boolean;
  detectiveAwake: boolean;
  guardianAngelAwake: boolean;
  day: boolean;
}

export interface IGamesDocument extends Document {
  players: Player[];
  gameId: string;
  stages: Stages;
  lastPlayerKilled: Player;
  nominatedPlayer: Player;
}

export type IUpdateGamesDocument = Pick<
  IGamesDocument,
  'players' | 'gameId' | 'stages' | 'lastPlayerKilled'
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
export const PlayerModel = model<IPlayerDocument>(`Player`, PlayerSchema);
