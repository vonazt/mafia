import { Schema, model, Document } from 'mongoose';

const PlayerSchema = new Schema({
  socketId: String,
  name: String,
  role: String,
  isAlive: { type: Boolean, default: true },
  nominated: { type: Boolean, default: false },
  votes: Number,
  connected: { type: Boolean, default: true },
});

const GameSchema = new Schema({
  players: [PlayerSchema],
  gameId: String,
});

export type Player = {
  socketId: string;
  name: string;
  role?: string;
  isAlive?: boolean;
  nominated?: boolean;
  votes?: number;
  connected?: boolean;
};

export interface IGamesDocument extends Document {
  players: Player[];
  gameId: string;
}

export const GamesModel = model<IGamesDocument>(`games`, GameSchema);
