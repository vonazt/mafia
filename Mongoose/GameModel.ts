import { Schema, model } from 'mongoose';
import { IGameDocument } from '../DomainObjects/Mongoose/GameDocuments';

const StageSchema = {
  intro: { type: Boolean, default: true },
  mafiaAwake: { type: Boolean, default: false },
  detectiveAwake: { type: Boolean, default: false },
  guardianAngelAwake: { type: Boolean, default: false },
  day: { type: Boolean, default: false },
  twoNominations: { type: Boolean, default: false },
  tie: { type: Boolean, default: false },
  playerLynched: { type: Boolean, default: false },
};

const GameSchema = new Schema({
  players: [{ type: Schema.Types.ObjectId, ref: `Player` }],
  gameId: String,
  stages: StageSchema,
  nominatedPlayers: [{ type: Schema.Types.ObjectId, ref: `Player` }],
  lastPlayerKilled: { type: Schema.Types.ObjectId, ref: `Player` },
});

const GamesModel = model<IGameDocument>(`Game`, GameSchema);

export default GamesModel
