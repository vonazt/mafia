import { Schema, model, Document } from 'mongoose';

const PlayerSchema = new Schema({
  socketId: String,
  name: String,
  role: String,
  alive: { type: Boolean, default: true },
  nominated: { type: Boolean, default: false },
  votes: Number,
});

const GameSchema = new Schema({
  players: [PlayerSchema],
  gameId: String,
});

export type Player = {
  socketId: string;
  name: string;
  role?: string;
  alive?: boolean;
  nominated?: boolean;
  votes?: number;
};

export interface IGamesDocument extends Document {
  players: Player[];
  gameId: string;
}

export const GamesModel = model<IGamesDocument>(`games`, GameSchema);
