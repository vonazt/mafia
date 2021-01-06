import { Document } from 'mongoose';
import { Player } from '../Player';

export interface IGameDocument extends Document {
  players: Player[];
  gameId: string;
  stage: string;
  lastPlayerKilled: Player;
  nominatedPlayers: Player[];
}

export type LeanGameDocument = Pick<
  IGameDocument,
  | 'players'
  | 'gameId'
  | 'stage'
  | 'lastPlayerKilled'
  | '_id'
  | 'nominatedPlayers'
>;
