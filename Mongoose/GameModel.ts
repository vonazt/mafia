import { Schema, model } from 'mongoose';
import { IGameDocument } from '../DomainObjects/Mongoose/GameDocuments';
import {
  INTRO,
  MAFIA_AWAKE,
  DETECTIVE_AWAKE,
  GUARDIAN_ANGEL_AWAKE,
  DAY,
  TWO_NOMINATIONS,
  TIE,
  PLAYER_LYNCHED,
} from '../constants';

const GameSchema = new Schema({
  players: [{ type: Schema.Types.ObjectId, ref: `Player` }],
  gameId: String,
  stage: {
    type: String,
    enum: [
      INTRO,
      MAFIA_AWAKE,
      DETECTIVE_AWAKE,
      GUARDIAN_ANGEL_AWAKE,
      DAY,
      TWO_NOMINATIONS,
      TIE,
      PLAYER_LYNCHED,
    ],
    default: INTRO,
  },
  nominatedPlayers: [{ type: Schema.Types.ObjectId, ref: `Player` }],
  lastPlayerKilled: { type: Schema.Types.ObjectId, ref: `Player` },
});

const GamesModel = model<IGameDocument>(`Game`, GameSchema);

export default GamesModel;
