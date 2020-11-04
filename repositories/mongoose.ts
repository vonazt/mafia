import { Schema, model, Document } from 'mongoose';

const PlayerSchema = new Schema({
  socketId: String,
  name: String,
  role: String,
  alive: { type: Boolean, default: true },
});

const GameSchema = new Schema({
  players: [PlayerSchema],
  playerCount: { type: Number, default: 0 },
  gameId: String,
});

type Players = {
  socketId: string;
  name: string;
  role?: string;
  alive?: boolean;
};

interface IGamesDocument extends Document {
  players: Players[];
  playerCount: number;
  gameId: string;
}

export const GamesModel = model<IGamesDocument>(`games`, GameSchema);
